
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

import type { ServiceOrder, ServiceOrderStatus as ServiceOrderStatusType, Client } from '@/lib/definitions';
import { ServiceOrderForm } from './service-order-form';
import { MoreHorizontal, PlusCircle, Edit, Printer, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { addTransaction } from '@/app/dashboard/finance/actions';
import { PrintableOrder } from './printable-order';
import { useReactToPrint } from 'react-to-print';

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
  const [osToPrint, setOsToPrint] = React.useState<ServiceOrder | null>(null);
  const printRef = React.useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handlePrint = useReactToPrint({
    contentRef: () => printRef.current,
    documentTitle: osToPrint ? `Recibo-${osToPrint.id.slice(0, 6)}` : 'Recibo',
    onAfterPrint: () => setOsToPrint(null),
  });

  const onPrintClick = React.useCallback(
    (e: React.MouseEvent, order: ServiceOrder) => {
      e.preventDefault();
      const client = clients.find((c) => c.id === order.clientId);
      if (client) {
        setOsToPrint({ ...order, clientCpf: client.cpf });
      } else {
        setOsToPrint(order);
      }
    },
    [clients]
  );
  
  React.useEffect(() => {
    if (osToPrint) {
      handlePrint();
    }
  }, [osToPrint, handlePrint]);


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

  const onFinalizeConfirm = async () => {
    if (!osToFinalize || !osToFinalize.finalValue) return;

    const transactionData = {
        type: 'income' as const,
        description: `Recebimento OS ${osToFinalize.id} - ${osToFinalize.equipment}`,
        amount: osToFinalize.finalValue,
        clientId: osToFinalize.clientId,
        clientName: osToFinalize.clientName
    };

    const result = await addTransaction(transactionData);

    if (result.success) {
        toast({
            title: "Sucesso!",
            description: `Lançamento de R$ ${osToFinalize.finalValue.toFixed(2)} para a OS ${osToFinalize.id} criado.`,
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

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
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
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden lg:table-cell">Equipamento</TableHead>
              <TableHead className="hidden md:table-cell">Entrada</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="w-[50px]">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialServiceOrders.length > 0 ? (
              initialServiceOrders.map((os) => {
                return (
                  <TableRow key={os.id}>
                    <TableCell className="font-bold">{os.id}</TableCell>
                    <TableCell className="font-medium">
                      <div className='flex flex-col'>
                        <span>{os.clientName}</span>
                        <span className='text-xs text-muted-foreground sm:hidden'>{os.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">{os.equipment}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(os.entryDate)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
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
                          
                           <DropdownMenuItem onClick={(e) => onPrintClick(e as unknown as React.MouseEvent, os)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Imprimir Recibo
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
                <TableCell colSpan={6} className="h-24 text-center">
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
              para a OS <span className="font-bold">{osToFinalize?.id}</span>?
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

      <div className="hidden">
        {osToPrint && <PrintableOrder ref={printRef} data={osToPrint} />}
      </div>
    </>
  );
}
