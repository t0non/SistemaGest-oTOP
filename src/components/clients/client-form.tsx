'use client';

import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {Button} from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {addClient, updateClient} from '@/app/dashboard/clients/actions';
import type {Client} from '@/lib/definitions';
import {useState} from 'react';
import { formatCPF, formatPhone } from '@/lib/formatters';

const clientFormSchema = z.object({
  name: z.string().min(3, {message: 'O nome deve ter pelo menos 3 caracteres.'}),
  cpf: z
    .string()
    .min(14, {message: 'O CPF deve ter 11 caracteres.'})
    .max(14, {message: 'O CPF deve ter no máximo 14 caracteres.'}),
  phone: z.string().min(14, {message: 'O telefone deve ter pelo menos 10 caracteres.'}),
  address: z.string().min(5, {message: 'O endereço deve ter pelo menos 5 caracteres.'}),
  notes: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface ClientFormProps {
  client?: Client | null;
  onSuccess: () => void;
}

export function ClientForm({client, onSuccess}: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {toast} = useToast();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: client?.name || '',
      cpf: client?.cpf ? formatCPF(client.cpf) : '',
      phone: client?.phone ? formatPhone(client.phone) : '',
      address: client?.address || '',
      notes: client?.notes || '',
    },
  });

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('cpf', formatCPF(e.target.value));
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('phone', formatPhone(e.target.value));
  };

  async function onSubmit(values: ClientFormValues) {
    setIsSubmitting(true);

    const dataToSave = {
      ...values,
      cpf: values.cpf.replace(/\D/g, ''),
      phone: values.phone.replace(/\D/g, ''),
    };

    const result = client
      ? await updateClient(client.id, dataToSave)
      : await addClient(dataToSave);

    if (result.success) {
      toast({
        title: 'Sucesso!',
        description: `Cliente ${client ? 'atualizado' : 'adicionado'} com sucesso.`,
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
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: João da Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cpf"
            render={({field}) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input placeholder="000.000.000-00" {...field} onChange={handleCpfChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({field}) => (
              <FormItem>
                <FormLabel>Telefone / WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="(31) 99999-9999" {...field} onChange={handlePhoneChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({field}) => (
            <FormItem>
              <FormLabel>Endereço Completo</FormLabel>
              <FormControl>
                <Input placeholder="Rua, Número, Bairro, Cidade - UF" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({field}) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Informações adicionais sobre o cliente..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando...'
            : client
            ? 'Salvar Alterações'
            : 'Adicionar Cliente'}
        </Button>
      </form>
    </Form>
  );
}
