
'use client';

import { z } from 'zod';
import type { Product } from '@/lib/definitions';
import { unformatCurrency } from '@/lib/formatters';

const productSchema = z.object({
  name: z.string().min(3, { message: 'O nome do produto é obrigatório.' }),
  quantity: z.coerce.number().min(0, { message: 'A quantidade não pode ser negativa.' }),
  costPrice: z.string().refine((val) => unformatCurrency(val) >= 0, { message: 'O custo deve ser positivo.' }),
  sellingPrice: z.string().refine((val) => unformatCurrency(val) >= 0, { message: 'O preço de venda deve ser positivo.' }),
  supplierName: z.string().optional(),
  supplierPhone: z.string().optional(),
});


type ActionResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

const getProductsFromStorage = (): Product[] => {
  if (typeof window === 'undefined') return [];
  const storedProducts = localStorage.getItem('products');
  return storedProducts ? JSON.parse(storedProducts) : [];
};

const saveProductsToStorage = (products: Product[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('products', JSON.stringify(products));
};

export function getProducts(query: string): Product[] {
  let products = getProductsFromStorage();
  if (!query) {
    return products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  const lowercasedQuery = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercasedQuery) ||
      product.supplierName?.toLowerCase().includes(lowercasedQuery)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addProduct(
  data: z.infer<typeof productSchema>
): ActionResponse {
  const validation = productSchema.safeParse(data);

  if (!validation.success) {
    console.log(validation.error);
    return { success: false, message: 'Dados inválidos.' };
  }

  let products = getProductsFromStorage();
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name: validation.data.name,
    quantity: validation.data.quantity,
    costPrice: unformatCurrency(validation.data.costPrice),
    sellingPrice: unformatCurrency(validation.data.sellingPrice),
    supplierName: validation.data.supplierName,
    supplierPhone: validation.data.supplierPhone?.replace(/\D/g, ''),
    createdAt: new Date().toISOString(),
  };

  products.unshift(newProduct);
  saveProductsToStorage(products);
  return { success: true, message: 'Produto adicionado com sucesso.', data: newProduct };
}

export function updateProduct(
  id: string,
  data: z.infer<typeof productSchema>
): ActionResponse {
  const validation = productSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: 'Dados inválidos.' };
  }

  let products = getProductsFromStorage();
  const productIndex = products.findIndex((c) => c.id === id);
  if (productIndex === -1) {
    return { success: false, message: 'Produto não encontrado.' };
  }

  const updatedProductData = {
    name: validation.data.name,
    quantity: validation.data.quantity,
    costPrice: unformatCurrency(validation.data.costPrice),
    sellingPrice: unformatCurrency(validation.data.sellingPrice),
    supplierName: validation.data.supplierName,
    supplierPhone: validation.data.supplierPhone?.replace(/\D/g, ''),
  };

  const updatedProduct = { ...products[productIndex], ...updatedProductData };
  products[productIndex] = updatedProduct;
  saveProductsToStorage(products);
  return { success: true, message: 'Produto atualizado com sucesso.', data: updatedProduct };
}

export function deleteProduct(id: string): ActionResponse {
  let products = getProductsFromStorage();
  const productIndex = products.findIndex((c) => c.id === id);
  if (productIndex === -1) {
    return { success: false, message: 'Produto não encontrado.' };
  }

  products.splice(productIndex, 1);
  saveProductsToStorage(products);
  return { success: true, message: 'Produto excluído com sucesso.' };
}
