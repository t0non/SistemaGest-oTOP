
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

import type {Product} from '@/lib/definitions';
import {ProductForm} from './product-form';
import {deleteProduct} from '@/app/dashboard/products/actions';
import {MoreHorizontal, PlusCircle, Trash2, Edit} from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

export function ProductList({initialProducts}: {initialProducts: Product[]}) {
  const [products, setProducts] = React.useState(initialProducts);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const {toast} = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const {replace} = useRouter();

  React.useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);


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
    setSelectedProduct(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const openDeleteAlert = (product: Product) => {
    setSelectedProduct(product);
    setIsAlertOpen(true);
  };
  
  const handleDelete = () => {
    if (!selectedProduct) return;

    const result = deleteProduct(selectedProduct.id);

    if (result.success) {
      toast({
        title: 'Sucesso!',
        description: 'Produto excluído com sucesso.',
      });
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      window.dispatchEvent(new Event('local-storage-changed'));
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro!',
        description: result.message || 'Não foi possível excluir o produto.',
      });
    }
    setIsAlertOpen(false);
    setSelectedProduct(null);
  };
  
  const handleFormSuccess = () => {
      setIsFormOpen(false);
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <Input
          placeholder="Buscar por nome ou fornecedor..."
          className="w-full sm:max-w-sm"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('query')?.toString()}
        />
        <Button onClick={openFormForNew} className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Produto
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="w-24 text-center">Qtd.</TableHead>
              <TableHead className="hidden md:table-cell w-32">Custo</TableHead>
              <TableHead className="hidden md:table-cell w-32">Venda</TableHead>
              <TableHead className="w-12">
                <span className="sr-only">Ações</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                        <span className='font-semibold'>{product.name}</span>
                        <span className="text-xs text-muted-foreground">{product.supplierName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={product.quantity <= 5 ? "destructive" : "secondary"} className={cn(product.quantity <= 0 && "opacity-50")}>
                        {product.quantity}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono">{formatCurrency(product.costPrice)}</TableCell>
                  <TableCell className="hidden md:table-cell font-mono font-semibold text-green-600">{formatCurrency(product.sellingPrice)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openFormForEdit(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteAlert(product)}
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
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">
              {selectedProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {selectedProduct
                ? 'Atualize os dados do produto.'
                : 'Preencha os dados do novo item de estoque.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={selectedProduct}
            onSuccess={handleFormSuccess}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o
              produto <span className='font-bold'>{selectedProduct?.name}</span>.
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
