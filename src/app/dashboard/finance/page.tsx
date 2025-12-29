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
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getMonthlyFinancialSummary, getTransactions, deleteTransaction } from './actions';
import StatCard from '@/components/dashboard/stat-card';
import { ArrowDown, ArrowUp, DollarSign, Package, PlusCircle, Edit, MoreHorizontal, Trash2, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TransactionForm } from '@/components/finance/transaction-form';
import type { Transaction } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { getClients } from '../clients/actions';
import type { Client } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { OverviewChart } from '@/components/dashboard/overview-chart';

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
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);

  const [startDate, setStartDate] = React.useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = React.useState(new Date().toISOString().split('T')[0]);

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
    
    const handleStorageChange = () => fetchData();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-changed', handleStorageChange);
    };

  }, [fetchData]);
  
  const chartData = React.useMemo(() => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T23:59:59');

    const filtered = transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      return transactionDate >= start && transactionDate <= end;
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

  }, [transactions, startDate, endDate]);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedTransaction(null);
    fetchData();
  };
  
  const openFormForNew = () => {
    setSelectedTransaction(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };
  
  const openDeleteAlert = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsAlertOpen(true);
  };

  const handleDelete = () => {
    if (!selectedTransaction) return;

    const result = deleteTransaction(selectedTransaction.id);

    if (result.success) {
      toast({
        title: 'Sucesso!',
        description: 'Transação excluída com sucesso.',
      });
      fetchData();
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: result.message || 'Não foi possível excluir a transação.',
      });
    }
    setIsAlertOpen(false);
    setSelectedTransaction(null);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };
  
  const ownerMap = {
    admin: { icon: User, label: 'Eduardo', color: 'text-blue-500' },
    pedro: { icon: User, label: 'Pedro', color: 'text-purple-500' },
    split: { icon: Users, label: 'Dividido', color: 'text-orange-500' },
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-headline font-bold">Financeiro</h1>
            <p className="text-muted-foreground">
              Acompanhe as entradas e saídas da sua loja.
            </p>
          </div>
           <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm w-full sm:w-auto">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold px-1">DE</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm bg-transparent outline-none font-medium text-gray-700 cursor-pointer"
              />
            </div>
            <span className="text-gray-400">|</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 font-bold px-1">ATÉ</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm bg-transparent outline-none font-medium text-gray-700 cursor-pointer"
              />
            </div>
          </div>
          <Button onClick={openFormForNew} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Movimentação
          </Button>
        </div>

        {loading ? (
            <Skeleton className="h-[350px] w-full" />
        ) : (
            <OverviewChart data={chartData} />
        )}


        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-12"><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map((transaction) => {
                  const ownerInfo = ownerMap[transaction.owner] || ownerMap.admin;
                  const OwnerIcon = ownerInfo.icon;
                  return (
                  <TableRow key={transaction.id}>
                    <TableCell className="hidden whitespace-nowrap md:table-cell">{formatDate(transaction.date)}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Tooltip>
                            <TooltipTrigger>
                                <OwnerIcon className={cn("h-4 w-4 text-muted-foreground", ownerInfo.color)} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Responsável: {ownerInfo.label}</p>
                            </TooltipContent>
                        </Tooltip>
                        <div className="flex flex-col">
                          <span className="truncate">{transaction.description}</span>
                          {transaction.clientName && <span className="text-xs text-muted-foreground">{transaction.clientName}</span>}
                          <span className="text-sm text-muted-foreground md:hidden">{formatDate(transaction.date)}</span>
                        </div>
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
                    <TableCell>
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openFormForEdit(transaction)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => openDeleteAlert(transaction)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => { if (!isOpen) { setSelectedTransaction(null); setIsFormOpen(false); } else { setIsFormOpen(true); }}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">
              {selectedTransaction ? 'Editar Movimentação' : 'Nova Movimentação'}
            </DialogTitle>
            <DialogDescription>
              {selectedTransaction ? 'Atualize os dados da movimentação.' : 'Lance uma nova entrada ou saída no seu caixa.'}
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            clients={clients} 
            onSuccess={handleFormSuccess} 
            transaction={selectedTransaction}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente a transação <span className='font-bold'>{selectedTransaction?.description}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
