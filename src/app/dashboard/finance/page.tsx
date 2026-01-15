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
import { deleteTransaction } from './actions';
import { PlusCircle, Edit, MoreHorizontal, Trash2, User, Users, Printer } from 'lucide-react';
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
import type { Client } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { useReactToPrint } from 'react-to-print';
import { PrintableFinancialReport } from '@/components/finance/printable-financial-report';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { useMemoFirebase, useFirestore, useUser } from '@/firebase';

interface FinancialSummary {
  revenue: number;
  expenses: number;
  profit: number;
}

export default function FinancePage() {
  const { isUserLoading } = useUser();
  const firestore = useFirestore();
  const [clients, setClients] = React.useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);

  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const { toast } = useToast();
  
  const reportRef = React.useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Relatorio-Financeiro-${startDate || 'inicio'}-ate-${endDate || 'fim'}`,
  });

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'transactions'), orderBy('date', 'desc'));
  }, [firestore]);
  
  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'clients'));
  }, [firestore]);


  const { data: allTransactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);
  const { data: allClients, isLoading: clientsLoadingFromHook } = useCollection<Client>(clientsQuery);

  React.useEffect(() => {
    if (!clientsLoadingFromHook && allClients) {
        setClients(allClients);
        setClientsLoading(false);
    }
  }, [clientsLoadingFromHook, allClients]);
  
  const filteredTransactions = React.useMemo(() => {
    if (!allTransactions) return [];
    
    if (!startDate && !endDate) {
        return allTransactions;
    }

    const start = startDate ? new Date(startDate + 'T00:00:00') : new Date('1970-01-01');
    const end = endDate ? new Date(endDate + 'T23:59:59') : new Date();
    
    return allTransactions.filter(t => {
      if (!t.date) return false;
      const transactionDate = (t.date as unknown as Timestamp).toDate();
      return transactionDate >= start && transactionDate <= end;
    });
  }, [allTransactions, startDate, endDate]);

  const periodSummary = React.useMemo(() => {
    let revenue = 0;
    let expenses = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'income') revenue += t.amount;
      else expenses += t.amount;
    });
    return { revenue, expenses, profit: revenue - expenses };
  }, [filteredTransactions]);

  const chartData = React.useMemo(() => {
    const grouped: Record<string, { income: number, expense: number }> = {};

    filteredTransactions.forEach(t => {
      if (!t.date) return;
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
  }, [filteredTransactions]);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedTransaction(null);
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

  const handleDelete = async () => {
    if (!selectedTransaction) return;

    const result = await deleteTransaction(selectedTransaction.id);
    
    if (result.success) {
      toast({
        title: 'Sucesso!',
        description: 'Transação excluída com sucesso.',
      });
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

  const formatDate = (date: unknown) => {
    if (!date) return "Data inválida";
    try {
        if (date instanceof Timestamp) {
            return format(date.toDate(), "dd/MM/yyyy", { locale: ptBR });
        }
        if (date instanceof Date) {
            return format(date, "dd/MM/yyyy", { locale: ptBR });
        }
        if (typeof date === 'string') {
          const parsedDate = parseISO(date);
          if (!isNaN(parsedDate.getTime())) {
            return format(parsedDate, "dd/MM/yyyy", { locale: ptBR });
          }
        }
        return "Data inválida";
    } catch {
        return "Data inválida"
    }
  };
  
  const ownerMap = {
    admin: { icon: User, label: 'Eduardo', color: 'text-blue-500' },
    pedro: { icon: User, label: 'Pedro', color: 'text-purple-500' },
    split: { icon: Users, label: 'Dividido', color: 'text-orange-500' },
  }
  
  const pageLoading = clientsLoading || isUserLoading || transactionsLoading;

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
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm w-full sm:w-auto">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-bold px-1">DE</span>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-sm bg-transparent outline-none font-medium text-foreground cursor-pointer"
                />
              </div>
              <span className="text-border">|</span>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground font-bold px-1">ATÉ</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-sm bg-transparent outline-none font-medium text-foreground cursor-pointer"
                />
              </div>
            </div>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={handlePrint} variant="outline" size="icon">
                        <Printer className="h-4 w-4" />
                        <span className="sr-only">Imprimir Relatório</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Imprimir Relatório</p>
                </TooltipContent>
            </Tooltip>
          </div>
          <Button onClick={openFormForNew} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Movimentação
          </Button>
        </div>

        {pageLoading ? (
            <Skeleton className="h-[410px] w-full" />
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
              {pageLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => {
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
      
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <PrintableFinancialReport 
          ref={reportRef} 
          transactions={filteredTransactions} 
          summary={periodSummary}
          startDate={startDate}
          endDate={endDate}
        />
      </div>

    </TooltipProvider>
  );
}
