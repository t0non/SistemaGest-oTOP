'use client'

import * as React from 'react';
import {getMonthlyFinancialSummary} from './finance/actions';
import StatCard from '@/components/dashboard/stat-card';
import {OverviewChart} from '@/components/dashboard/overview-chart';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {DollarSign, TrendingUp, Users, Package, ArrowUp, ArrowDown, UserCheck} from 'lucide-react';
import { getTransactions } from './finance/actions';
import { getClients } from './clients/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

interface FinancialSummary {
  revenue: number;
  expenses: number;
  profit: number;
  productsSold: number;
  adminProfit: number;
  pedroProfit: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = React.useState<FinancialSummary>({ revenue: 0, expenses: 0, profit: 0, productsSold: 0, adminProfit: 0, pedroProfit: 0 });
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [newClientsCount, setNewClientsCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(() => {
    setLoading(true);
    const summaryData = getMonthlyFinancialSummary();
    const transactionsData = getTransactions();
    
    const allClients = getClients('');
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const newClients = allClients.filter(c => new Date(c.createdAt) >= firstDayOfMonth);

    setSummary(summaryData);
    setTransactions(transactionsData);
    setNewClientsCount(newClients.length);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchData();

    const handleStorageChange = () => fetchData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-changed', handleStorageChange);
    };
  }, [fetchData]);

  const chartData = React.useMemo(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const filtered = transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      return transactionDate >= firstDayOfMonth;
    });

    const grouped: Record<string, { income: number, expense: number }> = {};

    filtered.forEach(t => {
      const dayKey = format(parseISO(t.date), 'yyyy-MM-dd');

      if (!grouped[dayKey]) grouped[dayKey] = { income: 0, expense: 0 };

      if (t.type === 'income') grouped[dayKey].income += Number(t.amount);
      if (t.type === 'expense') grouped[dayKey].expense += Number(t.amount);
    });

    return Object.keys(grouped).map(key => ({
      name: key,
      income: grouped[key].income,
      expense: grouped[key].expense
    })).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }, [transactions]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  if (loading) {
      return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <Card>
                <CardHeader>
                <CardTitle className="font-headline">Visão Geral Financeira</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[350px] w-full" />
                </CardContent>
            </Card>
          </div>
      )
  }

  const profitPerPartner = summary.profit / 2;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
            title="Entradas"
            value={formatCurrency(summary.revenue)}
            icon={ArrowUp}
            positive={true}
            description="Total de vendas no mês"
        />
        <StatCard
            title="Saídas"
            value={formatCurrency(summary.expenses)}
            icon={ArrowDown}
            positive={false}
            description="Total de despesas no mês"
        />
        <StatCard
          title="Vendas/Serviços"
          value={String(summary.productsSold)}
          icon={Package}
          description="Ordens de serviço finalizadas"
        />
        <StatCard
          title="Saldo Líquido"
          value={formatCurrency(summary.profit)}
          icon={TrendingUp}
          description="Faturamento - Despesas"
          positive={summary.profit >= 0}
        />
        <StatCard
            title="Por Sócio (50%)"
            value={formatCurrency(profitPerPartner)}
            icon={UserCheck}
            description="Metade do lucro líquido"
        />
      </div>
      
       <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
              <CardTitle className="font-headline">Novos Clientes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <div>
                        <p className="text-3xl font-bold">+{newClientsCount}</p>
                        <p className="text-sm text-muted-foreground">Clientes cadastrados no mês</p>
                    </div>
                </div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
              <CardTitle className="font-headline">Resumo por Sócio</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-around">
                    <div className='text-center'>
                        <p className='text-sm font-medium text-muted-foreground'>Saldo Eduardo</p>
                        <p className='text-2xl font-bold text-green-600'>{formatCurrency(summary.adminProfit)}</p>
                    </div>
                     <div className='text-center'>
                        <p className='text-sm font-medium text-muted-foreground'>Saldo Pedro</p>
                        <p className='text-2xl font-bold text-green-600'>{formatCurrency(summary.pedroProfit)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Visão Geral Financeira</CardTitle>
        </CardHeader>
        <CardContent>
            <OverviewChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
