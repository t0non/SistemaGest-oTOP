import {getMonthlyFinancialSummary} from './finance/actions';
import StatCard from '@/components/dashboard/stat-card';
import {OverviewChart} from '@/components/dashboard/overview-chart';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {DollarSign, TrendingUp, Users} from 'lucide-react';
import { mockTransactions } from '@/lib/mock-data';

export default async function DashboardPage() {
  // In a real app, you would fetch this data from your database.
  const {revenue, expenses, profit} = await getMonthlyFinancialSummary();
  const newClients = 5; // Mock data

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Faturamento do Mês"
          value={formatCurrency(revenue)}
          icon={DollarSign}
          description="Total de vendas e serviços"
        />
        <StatCard
          title="Lucro Líquido"
          value={formatCurrency(profit)}
          icon={TrendingUp}
          description="Faturamento - Despesas"
          positive={profit >= 0}
        />
        <StatCard
          title="Novos Clientes"
          value={`+${newClients}`}
          icon={Users}
          description="Clientes cadastrados no mês"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Visão Geral Financeira</CardTitle>
        </CardHeader>
        <CardContent>
            {/* The chart expects data grouped by day, which we are simulating here */}
            <OverviewChart data={mockTransactions} />
        </CardContent>
      </Card>
    </div>
  );
}
