
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

import type { ServiceOrder, ServiceOrderStatus, Client } from '@/lib/definitions';
import { ServiceOrderForm } from './service-order-form';
import { MoreHorizontal, PlusCircle, Edit, Printer, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

const statusColors: Record<ServiceOrderStatus, string> = {
    'Em Análise': 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30',
    'Aguardando Aprovação': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30',
    'Em Manutenção': 'bg-orange-500/20 text-orange-700 border-orange-500/30 hover:bg-orange-500/30',
    'Pronto para Retirada': 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30',
    'Finalizado/Entregue': 'bg-gray-500/20 text-gray-700 border-gray-500/30 hover:bg-gray-500/30',
};

export function ServiceOrderList({
  initialServiceOrders,
  clients
}: {
  initialServiceOrders: ServiceOrder[];
  clients: Client[];
}) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedOS, setSelectedOS] = React.useState<ServiceOrder | null>(null);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const openFormForNew = () => {
    setSelectedOS(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (os: ServiceOrder) => {
    setSelectedOS(os);
    setIsFormOpen(true);
  };
  
  const handleFinalize = (os: ServiceOrder) => {
      setSelectedOS(os);
      setIsAlertOpen(true);
  }

  const onFinalizeConfirm = async () => {
    if (!selectedOS) return;

    // In a real app, you would add logic here to create the transaction
    toast({
        title: "Lançamento Financeiro",
        description: `Lançamento de R$ ${selectedOS.finalValue} para a OS ${selectedOS.id} criado. (simulado)`,
    });
    setIsAlertOpen(false);
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
        <Button onClick={openFormForNew}>
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
                        <DropdownMenuItem onClick={() => openFormForEdit(os)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Printer className="mr-2 h-4 w-4" />
                          Imprimir Via
                        </DropdownMenuItem>
                        {os.status === 'Finalizado/Entregue' && os.finalValue && (
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

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-headline">
              {selectedOS ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </DialogTitle>
            <DialogDescription>
              {selectedOS
                ? 'Atualize os dados da OS.'
                : 'Preencha os dados da nova OS.'}
            </DialogDescription>
          </DialogHeader>
          <ServiceOrderForm
            serviceOrder={selectedOS}
            clients={clients}
            onSuccess={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Finalize Confirmation Alert */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lançar no Financeiro?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja criar um registro de entrada no valor de{' '}
              <span className="font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedOS?.finalValue || 0)}
              </span>{' '}
              para a OS <span className="font-bold">{selectedOS?.id}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onFinalizeConfirm}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
