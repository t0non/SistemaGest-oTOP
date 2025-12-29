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
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
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
import {useToast} from '@/hooks/use-toast';
import {useDebouncedCallback} from 'use-debounce';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';

import type {Client} from '@/lib/definitions';
import {ClientForm} from './client-form';
import {deleteClient, getClients} from '@/app/dashboard/clients/actions';
import {MoreHorizontal, PlusCircle, Trash2, Edit, MessageSquare} from 'lucide-react';
import { formatCPF, formatPhone } from '@/lib/formatters';

export function ClientList({initialClients}: {initialClients: Client[]}) {
  const [clients, setClients] = React.useState(initialClients);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(
    null
  );
  const {toast} = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const {replace} = useRouter();

  // Update state if initialClients prop changes
  React.useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);


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
    setSelectedClient(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (client: Client) => {
    setSelectedClient(client);
    setIsFormOpen(true);
  };

  const openDeleteAlert = (client: Client) => {
    setSelectedClient(client);
    setIsAlertOpen(true);
  };
  
  const openWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  }

  const handleDelete = () => {
    if (!selectedClient) return;

    const result = deleteClient(selectedClient.id);

    if (result.success) {
      toast({
        title: 'Sucesso!',
        description: 'Cliente excluído com sucesso.',
      });
      // Manually update the state to reflect deletion
      setClients(clients.filter(c => c.id !== selectedClient.id));
      // Notify other components that storage has changed
      window.dispatchEvent(new Event('local-storage-changed'));
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: result.message || 'Não foi possível excluir o cliente.',
      });
    }
    setIsAlertOpen(false);
    setSelectedClient(null);
  };
  
  const handleFormSuccess = () => {
      setIsFormOpen(false);
      // The parent component (`ClientsPage`) will handle refetching 
      // because it listens to the 'local-storage-changed' event.
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <Input
          placeholder="Buscar por nome ou CPF..."
          className="w-full sm:max-w-sm"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('query')?.toString()}
        />
        <Button onClick={openFormForNew} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Cliente
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">CPF</TableHead>
              <TableHead className="hidden sm:table-cell">Telefone</TableHead>
              <TableHead>
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length > 0 ? (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                        <span>{client.name}</span>
                        <span className="text-xs text-muted-foreground md:hidden">{formatCPF(client.cpf)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatCPF(client.cpf)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Button variant="ghost" size="sm" onClick={() => openWhatsApp(client.phone)}>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {formatPhone(client.phone)}
                    </Button>
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
                        <DropdownMenuItem onClick={() => openFormForEdit(client)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteAlert(client)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">
              {selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
            <DialogDescription>
              {selectedClient
                ? 'Atualize os dados do cliente.'
                : 'Preencha os dados do novo cliente.'}
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            client={selectedClient}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o
              cliente <span className='font-bold'>{selectedClient?.name}</span>.
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
    </>
  );
}
