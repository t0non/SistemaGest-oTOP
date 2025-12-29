
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { formatCurrency, unformatCurrency } from '@/lib/formatters';

const serviceOrderFormSchema = z.object({
  clientId: z.string({ required_error: 'Selecione um cliente.' }),
  equipment: z.string().min(3, { message: 'O nome do equipamento é obrigatório.' }),
  problemDescription: z.string().optional(),
  status: z.enum(ServiceOrderStatus, { required_error: 'Selecione um status.' }),
  finalValue: z.string().optional(),
  notes: z.string().optional(),
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

  const form = useForm<ServiceOrderFormValues>({
    resolver: zodResolver(serviceOrderFormSchema),
    defaultValues: {
      clientId: serviceOrder?.clientId || '',
      equipment: serviceOrder?.equipment || '',
      problemDescription: serviceOrder?.problemDescription || '',
      status: serviceOrder?.status || 'Em Análise',
      notes: serviceOrder?.notes || '',
      finalValue: serviceOrder?.finalValue ? formatCurrency(String(serviceOrder.finalValue)) : '',
    },
  });

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('finalValue', formatCurrency(e.target.value));
  };

  async function onSubmit(values: ServiceOrderFormValues) {
    setIsSubmitting(true);
    const selectedClient = clients.find(c => c.id === values.clientId);
    if (!selectedClient) {
        toast({
            variant: 'destructive',
            title: 'Erro!',
            description: 'Cliente selecionado não é válido.',
        });
        setIsSubmitting(false);
        return;
    }

    const dataToSave = {
        ...values,
        clientName: selectedClient.name,
        finalValue: values.finalValue ? unformatCurrency(values.finalValue) : undefined,
    };
    
    const result = serviceOrder?.id
      ? await updateServiceOrder(serviceOrder.id, dataToSave)
      : await addServiceOrder(dataToSave);

    if (result.success) {
      toast({
        title: 'Sucesso!',
        description: `Ordem de Serviço ${serviceOrder?.id ? 'atualizada' : 'adicionada'} com sucesso.`,
      });
      onSuccess();
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: result.message || 'Ocorreu um erro inesperado.',
      });
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!serviceOrder?.id}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipamento</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Notebook Dell Vostro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="problemDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Defeito Reclamado</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva o problema relatado pelo cliente..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ServiceOrderStatus.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="finalValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor Final (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    placeholder="R$ 0,00" 
                    {...field} 
                    onChange={handleCurrencyChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Internas</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalhes técnicos, peças utilizadas, etc..." {...field} />
              </FormControl>
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
