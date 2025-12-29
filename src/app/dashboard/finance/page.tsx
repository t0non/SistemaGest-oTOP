'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getMonthlyFinancialSummary, getTransactions } from './actions';
import StatCard from '@/components/dashboard/stat-card';
import { ArrowDown, ArrowUp, DollarSign, Package, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { TransactionForm } from '@/components/finance/transaction-form';
import type { Transaction } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { getClients } from '../clients/actions';
import type { Client } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

interface FinancialSummary {
  revenue: number;
  expenses: number;
  profit: number;
  productsSold: number;
}

export default function FinancePage() {
  const [summary, setSummary] = React.useState<FinancialSummary>({ revenue: 0, expenses: 0, profit: 0, productsSold: 0 });
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const { toast } = useToast();

  const fetchData = React.useCallback(() => {
    try {
      const summaryData = getMonthlyFinancialSummary();
      const transactionsData = getTransactions();
      const clientsData = getClients('');
      
      setSummary(summaryData);
      setTransactions(transactionsData);
      setClients(clientsData);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar dados',
        description: 'Não foi possível carregar as informações financeiras.',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
    
    // Listen for storage changes to update UI
    const handleStorageChange = () => fetchData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-changed', handleStorageChange); // Custom event
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-changed', handleStorageChange);
    };

  }, [fetchData]);

  const handleSuccess = () => {
    setIsFormOpen(false);
    fetchData(); // Refresh data after a new transaction is added
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-headline font-bold">Financeiro</h1>
            <p className="text-muted-foreground">
              Acompanhe as entradas e saídas da sua loja.
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Movimentação
          </Button>
        </div>

        {/* Resumo Cards */}
        {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Entradas no Mês"
                value={formatCurrency(summary.revenue)}
                icon={ArrowUp}
                positive={true}
            />
            <StatCard
                title="Saídas no Mês"
                value={formatCurrency(summary.expenses)}
                icon={ArrowDown}
                positive={false}
            />
             <StatCard
                title="Serviços/Vendas no Mês"
                value={String(summary.productsSold)}
                icon={Package}
            />
            <StatCard
                title="Saldo Líquido"
                value={formatCurrency(summary.profit)}
                icon={DollarSign}
                positive={summary.profit >= 0}
            />
            </div>
        )}


        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="hidden whitespace-nowrap md:table-cell">{formatDate(transaction.date)}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="truncate">{transaction.description}</span>
                        {transaction.clientName && <span className="text-xs text-muted-foreground">{transaction.clientName}</span>}
                        <span className="text-sm text-muted-foreground md:hidden">{formatDate(transaction.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.type === 'income'
                            ? 'default'
                            : 'destructive'
                        }
                        className={cn(transaction.type === 'income' && "bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
                          transaction.type === 'expense' && "bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
                        )}
                      >
                        {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-semibold whitespace-nowrap',
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      )}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">
              Nova Movimentação
            </DialogTitle>
            <DialogDescription>
              Lance uma nova entrada ou saída no seu caixa.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm clients={clients} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
