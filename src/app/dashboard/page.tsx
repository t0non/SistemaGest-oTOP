'use client'

import * as React from 'react';
import {getMonthlyFinancialSummary} from './finance/actions';
import StatCard from '@/components/dashboard/stat-card';
import {OverviewChart} from '@/components/dashboard/overview-chart';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {ArrowUp, ArrowDown, UserCheck, Package, Users} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, Timestamp, where, getCountFromServer } from 'firebase/firestore';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { Transaction } from '@/lib/definitions';
import { TrendingUp } from 'lucide-react';


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
  const [newClientsCount, setNewClientsCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const firestore = useFirestore();
  const { isUserLoading } = useUser();

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return query(collection(firestore, 'transactions'), where('date', '>=', startOfMonth), orderBy('date', 'desc'));
  }, [firestore]);

  const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const fetchData = React.useCallback(async () => {
    if(!firestore) return;
    setLoading(true);
    
    // Fetch financial summary from Firestore
    const summaryData = await getMonthlyFinancialSummary();
    
    // Fetch new clients count from Firestore
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const clientsRef = collection(firestore, 'clients');
    const newClientsQuery = query(clientsRef, where('createdAt', '>=', firstDayOfMonth));
    const newClientsSnapshot = await getCountFromServer(newClientsQuery);
    const newClientsCount = newClientsSnapshot.data().count;

    setSummary(summaryData);
    setNewClientsCount(newClientsCount);
    setLoading(false);
  }, [firestore]);

  React.useEffect(() => {
    if(!isUserLoading && firestore) {
      fetchData();
    }
  }, [isUserLoading, firestore, fetchData]);
  
  React.useEffect(() => {
    if(transactions) {
        fetchData();
    }
  }, [transactions, fetchData]);


  const chartData = React.useMemo(() => {
    if (!transactions) return [];

    const grouped: Record<string, { income: number, expense: number }> = {};

    transactions.forEach(t => {
      const transactionDate = (t.date as unknown as Timestamp).toDate();
      const dayKey = format(transactionDate, 'yyyy-MM-dd');

      if (!grouped[dayKey]) grouped[dayKey] = { income: 0, expense: 0 };

      if (t.type === 'income') grouped[dayKey].income += Number(t.amount);
      if (t.type === 'expense') grouped[dayKey].expense += Number(t.amount);
    });

    return Object.keys(grouped).map(key => {
        const inc = grouped[key].income;
        const exp = grouped[key].expense;
        return {
            name: format(parseISO(key), "dd/MM"),
            income: inc,
            expense: exp,
            saldo: inc - exp,
        }
    }).sort((a,b) => {
        const [dayA, monthA] = a.name.split('/');
        const [dayB, monthB] = b.name.split('/');
        if (monthA !== monthB) return parseInt(monthA) - parseInt(monthB);
        return parseInt(dayA) - parseInt(dayB);
    });
  }, [transactions]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  if (loading || transactionsLoading || isUserLoading) {
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
            value={formatCurrency(summary.profit / 2)}
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

      <OverviewChart data={chartData} />

    </div>
  );
}
