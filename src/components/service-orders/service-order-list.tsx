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
  const [editingOS, setEditingOS] = React.useState<ServiceOrder | 'new' | null>(null);
  const [osToFinalize, setOsToFinalize] = React.useState<ServiceOrder | null>(null);
  
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Garante que o modal comece fechado no primeiro render
  React.useEffect(() => {
    setEditingOS(null);
    
    // Cleanup ao sair da tela para garantir que o body não fique travado
    return () => {
      document.body.style.pointerEvents = "";
      document.body.removeAttribute("data-scroll-locked");
    };
  }, []);

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

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <Input
          placeholder="Buscar por cliente, equipamento ou ID..."
          className="max-w-sm"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('query')?.toString()}
        />
        <Button onClick={() => setEditingOS('new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova OS
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="hidden md:table-cell">Equipamento</TableHead>
              <TableHead className="hidden sm:table-cell">Data de Entrada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialServiceOrders.length > 0 ? (
              initialServiceOrders.map((os) => (
                <TableRow key={os.id}>
                  <TableCell className="font-bold">{os.id}</TableCell>
                  <TableCell className="font-medium">{os.clientName}</TableCell>
                  <TableCell className="hidden md:table-cell">{os.equipment}</TableCell>
                  <TableCell className="hidden sm:table-cell">{formatDate(os.entryDate)}</TableCell>
                  <TableCell>
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
                        <DropdownMenuItem onClick={() => setEditingOS(os)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir Via
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
              ))
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

      {/* --- Modal Único para Edição/Criação --- */}
      <Dialog 
        open={!!editingOS} 
        onOpenChange={(isOpen) => {
            if (!isOpen) {
                setEditingOS(null);
                 // HACK DE SEGURANÇA: Remove a trava do corpo manualmente
                setTimeout(() => {
                  document.body.style.pointerEvents = "";
                  document.body.removeAttribute("data-scroll-locked");
                }, 100); 
            }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline">
              {editingOS === 'new' ? 'Nova Ordem de Serviço' : 'Editar Ordem de Serviço'}
            </DialogTitle>
            <DialogDescription>
              {editingOS === 'new'
                ? 'Preencha os dados da nova OS.'
                : 'Atualize os dados da OS.'}
            </DialogDescription>
          </DialogHeader>
          {editingOS && (
            <ServiceOrderForm
                key={editingOS === 'new' ? 'new-os' : editingOS.id}
                serviceOrder={editingOS === 'new' ? null : editingOS}
                clients={clients}
                onSuccess={() => setEditingOS(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* --- Modal Único para Confirmação de Finalização --- */}
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
    </>
  );
}
