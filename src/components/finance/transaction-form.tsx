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
import { unformatCurrency, formatCurrency } from '@/lib/formatters';
import type { Client, Transaction, TransactionOwner } from '@/lib/definitions';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Timestamp } from 'firebase/firestore';

const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense'], {
    required_error: 'Selecione o tipo da movimentação.',
  }),
  description: z.string().min(3, { message: 'A descrição é obrigatória.' }),
  amount: z.string().refine((val) => unformatCurrency(val) > 0, {
    message: 'O valor deve ser maior que zero.',
  }),
  owner: z.enum(['admin', 'pedro', 'split'], { required_error: 'Selecione um responsável.' }),
  clientId: z.string().optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data inválida." }),
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

  const defaultDate = transaction?.date 
    ? ((transaction.date instanceof Timestamp) ? transaction.date.toDate() : new Date(transaction.date)).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: transaction?.type || 'expense',
      description: transaction?.description || '',
      amount: transaction?.amount ? formatCurrency(transaction.amount) : '',
      owner: transaction?.owner || 'admin',
      clientId: transaction?.clientId || undefined,
      date: defaultDate,
    },
  });

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('amount', formatCurrency(e.target.value));
  };
  
  async function onSubmit(values: TransactionFormValues) {
    setIsSubmitting(true);
    
    const client = clients.find(c => c.id === values.clientId);

    const dataToSave = {
      ...values,
      amount: unformatCurrency(values.amount),
      clientName: client?.name,
      date: new Date(values.date), 
    };

    const result = transaction?.id 
        ? updateTransaction(transaction.id, dataToSave as any)
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
          name="owner"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Responsável</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="admin" />
                    </FormControl>
                    <FormLabel className="font-normal">Eduardo</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="pedro" />
                    </FormControl>
                    <FormLabel className="font-normal">Pedro</FormLabel>
                  </FormItem>
                   <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="split" />
                    </FormControl>
                    <FormLabel className="font-normal">Dividido</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <div className="grid grid-cols-2 gap-4">
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
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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