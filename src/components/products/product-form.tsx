
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
import {useToast} from '@/hooks/use-toast';
import {addProduct, updateProduct} from '@/app/dashboard/products/actions';
import type {Product} from '@/lib/definitions';
import {useState} from 'react';
import { formatCurrency, formatPhone, unformatCurrency } from '@/lib/formatters';

const productFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome do produto é obrigatório.' }),
  quantity: z.coerce.number().min(0, { message: 'A quantidade não pode ser negativa.' }),
  costPrice: z.string().refine((val) => unformatCurrency(val) >= 0, { message: 'O custo deve ser positivo.' }),
  sellingPrice: z.string().refine((val) => unformatCurrency(val) >= 0, { message: 'O preço de venda deve ser positivo.' }),
  supplierName: z.string().optional(),
  supplierPhone: z.string().optional(),
});


type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
}

export function ProductForm({product, onSuccess}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {toast} = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || '',
      quantity: product?.quantity || 0,
      costPrice: product ? formatCurrency(product.costPrice) : '',
      sellingPrice: product ? formatCurrency(product.sellingPrice) : '',
      supplierName: product?.supplierName || '',
      supplierPhone: product?.supplierPhone ? formatPhone(product.supplierPhone) : '',
    },
  });

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'costPrice' | 'sellingPrice') => {
    form.setValue(fieldName, formatCurrency(e.target.value));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('supplierPhone', formatPhone(e.target.value));
  };

  async function onSubmit(values: ProductFormValues) {
    setIsSubmitting(true);

    const result = product
      ? updateProduct(product.id, values)
      : addProduct(values);

    if (result.success) {
      toast({
        title: 'Sucesso!',
        description: `Produto ${product ? 'atualizado' : 'adicionado'} com sucesso.`,
      });
      window.dispatchEvent(new Event('local-storage-changed'));
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem>
              <FormLabel>Nome da Peça/Produto</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Tela iPhone 11, SSD 240GB Kingston" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="costPrice"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Custo (R$)</FormLabel>
                  <FormControl>
                    <Input placeholder="R$ 0,00" {...field} onChange={(e) => handleCurrencyChange(e, 'costPrice')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sellingPrice"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Venda (R$)</FormLabel>
                  <FormControl>
                    <Input placeholder="R$ 0,00" {...field} onChange={(e) => handleCurrencyChange(e, 'sellingPrice')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplierName"
            render={({field}) => (
              <FormItem>
                <FormLabel>Fornecedor (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: InfoPeças BH" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="supplierPhone"
            render={({field}) => (
              <FormItem>
                <FormLabel>Telefone Fornecedor</FormLabel>
                <FormControl>
                  <Input placeholder="(31) 99999-9999" {...field} onChange={handlePhoneChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? 'Salvando...'
            : product
            ? 'Salvar Alterações'
            : 'Adicionar Produto'}
        </Button>
      </form>
    </Form>
  );
}
