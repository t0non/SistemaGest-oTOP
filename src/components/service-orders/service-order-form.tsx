'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addServiceOrder, updateServiceOrder } from '@/app/dashboard/service-orders/actions';
import type { Client, ServiceOrder } from '@/lib/definitions';
import { ServiceOrderStatus } from '@/lib/definitions';
import { useState } from 'react';
import { formatCurrency } from '@/lib/formatters';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

const serviceOrderItemSchema = z.object({
  id: z.string(),
  description: z.string().min(3, 'Descreva o item/serviço.'),
  quantity: z.coerce.number().min(1, 'Qtd. deve ser no mínimo 1.'),
  unitPrice: z.coerce.number().min(0, 'O preço não pode ser negativo.'),
});

const serviceOrderFormSchema = z.object({
  clientId: z.string({ required_error: 'Selecione um cliente.' }).min(1, { message: 'Selecione um cliente.' }),
  equipment: z.string().min(3, { message: 'O nome do equipamento é obrigatório.' }),
  problemDescription: z.string().optional(),
  status: z.enum(ServiceOrderStatus, { required_error: 'Selecione um status.' }),
  notes: z.string().optional(),
  entryDate: z.string().min(1, { message: "A data de entrada é obrigatória." }),
  items: z.array(serviceOrderItemSchema).min(1, 'Adicione pelo menos um item ou serviço.'),
});


type ServiceOrderFormValues = z.infer<typeof serviceOrderFormSchema>;

interface ServiceOrderFormProps {
  serviceOrder?: ServiceOrder | null;
  clients: Client[];
  onSuccess: () => void;
}

export function ServiceOrderForm({
  serviceOrder,
  clients,
  onSuccess,
}: ServiceOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getInitialDate = () => {
    if (serviceOrder?.entryDate) {
        const d = (serviceOrder.entryDate as unknown as Timestamp)?.toDate ? (serviceOrder.entryDate as unknown as Timestamp).toDate() : new Date(serviceOrder.entryDate);
        if (!isNaN(d.getTime())) {
            return d.toISOString().split('T')[0];
        }
    }
    return new Date().toISOString().split('T')[0];
  };

  const form = useForm<ServiceOrderFormValues>({
    resolver: zodResolver(serviceOrderFormSchema),
    defaultValues: {
      clientId: serviceOrder?.clientId || undefined,
      equipment: serviceOrder?.equipment || '',
      problemDescription: serviceOrder?.problemDescription || '',
      status: serviceOrder?.status || 'Em Análise',
      notes: serviceOrder?.notes || '',
      entryDate: getInitialDate(),
      items: serviceOrder?.items || [{ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const watchedItems = form.watch('items');
  const totalValue = watchedItems.reduce((acc, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.unitPrice) || 0;
      return acc + (quantity * price);
  }, 0);


  async function onSubmit(values: ServiceOrderFormValues) {
    setIsSubmitting(true);
    const selectedClient = clients.find(c => c.id === values.clientId);
    if (!selectedClient) {
        toast({ variant: 'destructive', title: 'Erro!', description: 'Cliente selecionado não é válido.' });
        setIsSubmitting(false);
        return;
    }
    
    const entryDate = new Date(values.entryDate + 'T12:00:00Z');

    const dataToSave = {
        ...values,
        clientName: selectedClient.name,
        entryDate: Timestamp.fromDate(entryDate),
    };
    
    const result = serviceOrder?.id
      ? updateServiceOrder(serviceOrder.id, dataToSave)
      : addServiceOrder(dataToSave as any);

    if (result.success) {
      toast({ title: 'Sucesso!', description: `Ordem de Serviço ${serviceOrder?.id ? 'atualizada' : 'adicionada'} com sucesso.` });
      onSuccess();
    } else {
      toast({ variant: 'destructive', title: 'Erro!', description: result.message || 'Ocorreu um erro inesperado.' });
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        <FormField
          control={form.control} name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!serviceOrder?.id}>
                <FormControl><SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger></FormControl>
                <SelectContent>{clients.map((client) => (<SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>))}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control} name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipamento Principal</FormLabel>
              <FormControl><Input placeholder="Ex: Notebook Dell Vostro, iPhone 13" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control} name="problemDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Defeito Reclamado</FormLabel>
              <FormControl><Textarea placeholder="Descreva o problema relatado pelo cliente..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* --- ITENS DA OS --- */}
        <div className="space-y-3 rounded-lg border p-4">
            <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold">Itens e Serviços</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start border-t pt-3">
                  <div className="col-span-12 md:col-span-5">
                      <FormLabel className="text-xs">Descrição</FormLabel>
                      <FormField control={form.control} name={`items.${index}.description`} render={({ field }) => (
                          <FormItem><FormControl><Input placeholder="Ex: Troca de Tela, Formatação" {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                  </div>
                  <div className="col-span-4 md:col-span-2">
                       <FormLabel className="text-xs">Qtd.</FormLabel>
                       <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                           <FormItem><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                       )}/>
                  </div>
                   <div className="col-span-6 md:col-span-3">
                       <FormLabel className="text-xs">Valor Unit. (R$)</FormLabel>
                       <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => (
                           <FormItem>
                               <FormControl>
                                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                               </FormControl>
                               <FormMessage />
                           </FormItem>
                       )}/>
                  </div>
                  <div className="col-span-2 md:col-span-2 flex items-end h-full">
                       <Button type="button" variant="destructive" size="icon" className="w-full h-10" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                       </Button>
                  </div>
              </div>
            ))}
            {form.formState.errors.items && <FormMessage>{form.formState.errors.items.message}</FormMessage>}

            <div className="flex justify-end items-center pt-4 border-t">
                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                </div>
            </div>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField control={form.control} name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                  <SelectContent>{ServiceOrderStatus.map((status) => (<SelectItem key={status} value={status}>{status}</SelectItem>))}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField control={form.control} name="entryDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Entrada</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField control={form.control} name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Internas (Não aparece na impressão)</FormLabel>
              <FormControl><Textarea placeholder="Detalhes técnicos, peças utilizadas, etc..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : serviceOrder?.id ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}
        </Button>
      </form>
    </Form>
  );
}
