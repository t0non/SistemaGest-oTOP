'use client'

import * as React from 'react';
import {getMonthlyFinancialSummary} from './finance/actions';
import StatCard from '@/components/dashboard/stat-card';
import {OverviewChart} from '@/components/dashboard/overview-chart';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {DollarSign, TrendingUp, Users, User, Briefcase, UserCheck} from 'lucide-react';
import { getTransactions } from './finance/actions';
import { getClients } from './clients/actions';
import { Skeleton } from '@/components/ui/skeleton';

interface FinancialSummary {
  revenue: number;
  expenses: number;
  profit: number;
  adminProfit: number;
  pedroProfit: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = React.useState<FinancialSummary>({ revenue: 0, expenses: 0, profit: 0, adminProfit: 0, pedroProfit: 0 });
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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  if (loading) {
      return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Faturamento Bruto"
          value={formatCurrency(summary.revenue)}
          icon={DollarSign}
          description="Total de vendas no mês"
        />
        <StatCard
          title="Lucro Líquido (Geral)"
          value={formatCurrency(summary.profit)}
          icon={TrendingUp}
          description="Faturamento - Despesas"
          positive={summary.profit >= 0}
        />
        <StatCard
          title="Meu Saldo (Eduardo)"
          value={formatCurrency(summary.adminProfit)}
          icon={User}
          description="Seu lucro líquido no mês"
           positive={summary.adminProfit >= 0}
        />
        <StatCard
          title="Saldo Pedro"
          value={formatCurrency(summary.pedroProfit)}
          icon={Briefcase}
          description="Lucro líquido do sócio"
           positive={summary.pedroProfit >= 0}
        />
        <StatCard
            title="Por Sócio (50%)"
            value={formatCurrency(summary.profit / 2)}
            icon={UserCheck}
            description="Metade do lucro líquido"
        />
        <StatCard
          title="Novos Clientes"
          value={`+${newClientsCount}`}
          icon={Users}
          description="Clientes cadastrados no mês"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Visão Geral Financeira</CardTitle>
        </CardHeader>
        <CardContent>
            <OverviewChart data={transactions} />
        </CardContent>
      </Card>
    </div>
  );
}
