'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { addTransaction, updateTransaction } from '@/app/dashboard/finance/actions';
import { unformatCurrency, formatCurrency as formatCurrencyString } from '@/lib/formatters';
import type { Client, Transaction } from '@/lib/definitions';
import { Textarea } from '../ui/textarea';

const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense'], {
    required_error: 'Selecione o tipo da movimentação.',
  }),
  description: z.string().min(3, { message: 'A descrição é obrigatória.' }),
  amount: z.string().refine((val) => unformatCurrency(val) > 0, {
    message: 'O valor deve ser maior que zero.',
  }),
  clientId: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  transaction?: Transaction | null;
  clients: Client[];
  onSuccess: () => void;
}

export function TransactionForm({ transaction, clients, onSuccess }: TransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: transaction?.type || 'expense',
      description: transaction?.description || '',
      amount: transaction?.amount ? formatCurrencyString(transaction.amount) : '',
      clientId: transaction?.clientId || undefined,
    },
  });

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('amount', formatCurrencyString(e.target.value));
  };
  
  async function onSubmit(values: TransactionFormValues) {
    setIsSubmitting(true);
    
    const client = clients.find(c => c.id === values.clientId);

    const dataToSave = {
      ...values,
      amount: unformatCurrency(values.amount),
      clientName: client?.name,
    };

    const result = transaction?.id 
        ? updateTransaction(transaction.id, dataToSave)
        : addTransaction(dataToSave);

    if (result.success) {
      toast({
        title: 'Sucesso!',
        description: `Movimentação ${transaction?.id ? 'atualizada' : 'adicionada'} com sucesso.`,
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
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Entrada</SelectItem>
                  <SelectItem value="expense">Saída</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Pagamento de aluguel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="R$ 0,00"
                  {...field}
                  onChange={handleCurrencyChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vincular a um Cliente (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : transaction?.id ? 'Salvar Alterações' : 'Adicionar Movimentação'}
        </Button>
      </form>
    </Form>
  );
}