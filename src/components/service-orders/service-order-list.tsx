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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { useToast } from '@/hooks/use-toast';
import { useDebouncedCallback } from 'use-debounce';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';
import { Timestamp } from 'firebase/firestore';

import type { ServiceOrder, ServiceOrderStatus as ServiceOrderStatusType, Client, TransactionOwner } from '@/lib/definitions';
import { ServiceOrderForm } from './service-order-form';
import { MoreHorizontal, PlusCircle, Edit, Printer, CheckCircle, FileText } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { addTransaction } from '@/app/dashboard/finance/actions';
import { PrintableOrder } from './printable-order';
import { PrintableQuote } from './printable-quote';


const statusColors: Record<ServiceOrderStatusType, string> = {
    'Em Análise': 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    'Aguardando Aprovação': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
    'Em Manutenção': 'bg-orange-500/20 text-orange-700 border-orange-500/30 hover:bg-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
    'Pronto para Retirada': 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
    'Finalizado/Entregue': 'bg-gray-500/20 text-gray-700 border-gray-500/30 hover:bg-gray-500/30 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20',
};


export function ServiceOrderList({
  initialServiceOrders,
  clients
}: {
  initialServiceOrders: ServiceOrder[];
  clients: Client[];
}) {
  const [editingOS, setEditingOS] = React.useState<ServiceOrder | null>(null);
  const [osToFinalize, setOsToFinalize] = React.useState<ServiceOrder | null>(null);
  
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const [reciboData, setReciboData] = React.useState<ServiceOrder | null>(null);
  const reciboRef = React.useRef<HTMLDivElement>(null);
  const printRecibo = useReactToPrint({
    content: () => reciboRef.current,
    documentTitle: `Recibo-${reciboData?.id?.slice(0,6)}`,
    onPrintError: (error) => console.error("Erro impressão recibo:", error),
  });

  const gerarRecibo = (order: ServiceOrder) => {
    setReciboData(order);
    setTimeout(() => { 
        if (reciboRef.current) {
             printRecibo();
        } else {
            console.error("A referência para o recibo é nula.");
            toast({ variant: 'destructive', title: 'Erro de Impressão', description: 'Não foi possível encontrar o conteúdo para imprimir.'});
        }
    }, 100);
  };


  const [orcamentoData, setOrcamentoData] = React.useState<ServiceOrder | null>(null);
  const orcamentoRef = React.useRef<HTMLDivElement>(null);
  const printOrcamento = useReactToPrint({
    content: () => orcamentoRef.current,
    documentTitle: `Orcamento-${orcamentoData?.id?.slice(0,6)}`,
    onPrintError: (error) => console.error("Erro impressão orçamento:", error),
  });

  const gerarOrcamento = (order: ServiceOrder) => {
    setOrcamentoData(order);
    setTimeout(() => {
      if (orcamentoRef.current) {
        printOrcamento();
      } else {
         console.error("A referência para o orçamento é nula.");
         toast({ variant: 'destructive', title: 'Erro de Impressão', description: 'Não foi possível encontrar o conteúdo para imprimir.'});
      }
    }, 100);
  };

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleFinalize = (os: ServiceOrder) => {
      setOsToFinalize(os);
  }

  const onFinalizeConfirm = () => {
    if (!osToFinalize || !osToFinalize.finalValue) return;

    const transactionData = {
        type: 'income' as const,
        description: `Recebimento OS #${osToFinalize.id.slice(0,6)} - ${osToFinalize.equipment}`,
        amount: osToFinalize.finalValue,
        clientId: osToFinalize.clientId,
        clientName: osToFinalize.clientName,
        date: new Date(),
        owner: 'split' as TransactionOwner,
    };

    const result = addTransaction(transactionData);

    if (result.success) {
        toast({
            title: "Sucesso!",
            description: `Lançamento de R$ ${osToFinalize.finalValue.toFixed(2)} para a OS #${osToFinalize.id.slice(0,6)} criado.`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Erro no lançamento",
            description: result.message || "Não foi possível criar o lançamento financeiro.",
        });
    }
    setOsToFinalize(null);
  }

  const formatDate = (date: unknown) => {
    if (!date) return "Data inválida";
    try {
        const d = (date as Timestamp)?.toDate ? (date as Timestamp).toDate() : new Date(date as string);
        if (isNaN(d.getTime())) return "Data inválida";
        return format(d, "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };
  
  const handleOpenForm = (os: ServiceOrder | 'new') => {
      setEditingOS(os === 'new' ? {id: ''} as ServiceOrder : os);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <Input
          placeholder="Buscar por cliente, equipamento ou ID..."
          className="w-full sm:max-w-sm"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('query')?.toString()}
        />
        <Button onClick={() => handleOpenForm('new')} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova OS
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] hidden sm:table-cell">ID</TableHead>
              <TableHead>Cliente / Equipamento</TableHead>
              <TableHead className="hidden lg:table-cell">Entrada</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="text-right w-12">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialServiceOrders.length > 0 ? (
              initialServiceOrders.map((os) => {
                const client = clients.find(c => c.id === os.clientId);
                const orderWithCpf = client ? { ...os, clientCpf: client.cpf } : os;
                return (
                  <TableRow key={os.id}>
                    <TableCell className="font-bold hidden sm:table-cell">{os.id.substring(0, 8)}</TableCell>
                    <TableCell className="font-medium">
                      <div className='flex flex-col'>
                        <span className="font-semibold">{os.clientName}</span>
                        <span className='text-sm text-muted-foreground'>{os.equipment}</span>
                         <span className='text-xs text-muted-foreground md:hidden'>{os.status} - {formatDate(os.entryDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDate(os.entryDate)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={cn('font-semibold', statusColors[os.status])}>
                        {os.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenForm(os)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>

                           <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            onClick={() => gerarRecibo(orderWithCpf)}
                            className="cursor-pointer"
                           >
                              <Printer className="mr-2 h-4 w-4" />
                              Imprimir Recibo
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            onClick={() => gerarOrcamento(orderWithCpf)}
                            className="cursor-pointer"
                           >
                              <FileText className="mr-2 h-4 w-4" />
                              Gerar Orçamento
                          </DropdownMenuItem>

                          {os.status === 'Finalizado/Entregue' && os.finalValue && os.finalValue > 0 && (
                              <DropdownMenuItem onClick={() => handleFinalize(os)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Lançar no Financeiro
                              </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhuma Ordem de Serviço encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog 
        open={!!editingOS} 
        onOpenChange={(isOpen) => {
            if (!isOpen) {
                setEditingOS(null);
            }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline">
              {editingOS?.id ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </DialogTitle>
            <DialogDescription>
              {editingOS?.id
                ? 'Atualize os dados da OS.'
                : 'Preencha os dados da nova OS.'}
            </DialogDescription>
          </DialogHeader>
          {editingOS && (
            <ServiceOrderForm
                key={editingOS.id || 'new-os'}
                serviceOrder={editingOS.id ? editingOS : null}
                clients={clients}
                onSuccess={() => setEditingOS(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!osToFinalize} onOpenChange={(isOpen) => !isOpen && setOsToFinalize(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lançar no Financeiro?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja criar um registro de entrada no valor de{' '}
              <span className="font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(osToFinalize?.finalValue || 0)}
              </span>{' '}
              para a OS <span className="font-bold">#{osToFinalize?.id.slice(0,6)}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOsToFinalize(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onFinalizeConfirm}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div style={{ display: 'none' }}>
        {reciboData && <PrintableOrder ref={reciboRef} data={reciboData} />}
        {orcamentoData && <PrintableQuote ref={orcamentoRef} data={orcamentoData} />}
      </div>
    </>
  );
}