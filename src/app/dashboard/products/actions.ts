'use client';

import { z } from 'zod';
import type { Product } from '@/lib/definitions';
import { unformatCurrency } from '@/lib/formatters';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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

export function addProduct(
  data: z.infer<typeof productSchema>
): ActionResponse {
  const validation = productSchema.safeParse(data);

  if (!validation.success) {
    console.log(validation.error);
    return { success: false, message: 'Dados inválidos.' };
  }

  try {
    const dataToSave: Omit<Product, 'id' | 'createdAt'> = {
      name: validation.data.name,
      quantity: validation.data.quantity,
      costPrice: unformatCurrency(validation.data.costPrice),
      sellingPrice: unformatCurrency(validation.data.sellingPrice),
      supplierName: validation.data.supplierName,
      supplierPhone: validation.data.supplierPhone?.replace(/\D/g, ''),
    };

    addDocumentNonBlocking(collection(db, 'products'), { ...dataToSave, createdAt: serverTimestamp() });
    
    return { success: true, message: 'Produto adicionado com sucesso.' };
  } catch(e: any) {
    return { success: false, message: e.message || 'Ocorreu um erro ao adicionar o produto.' };
  }
}

export function updateProduct(
  id: string,
  data: z.infer<typeof productSchema>
): ActionResponse {
  const validation = productSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: 'Dados inválidos.' };
  }

  try {
    const docRef = doc(db, 'products', id);
    const dataToUpdate = {
      name: validation.data.name,
      quantity: validation.data.quantity,
      costPrice: unformatCurrency(validation.data.costPrice),
      sellingPrice: unformatCurrency(validation.data.sellingPrice),
      supplierName: validation.data.supplierName,
      supplierPhone: validation.data.supplierPhone?.replace(/\D/g, ''),
    };

    updateDocumentNonBlocking(docRef, dataToUpdate);
    return { success: true, message: 'Produto atualizado com sucesso.' };
  } catch(e: any) {
    return { success: false, message: e.message || 'Ocorreu um erro ao atualizar o produto.' };
  }
}

export function deleteProduct(id: string): ActionResponse {
  try {
    const docRef = doc(db, 'products', id);
    deleteDocumentNonBlocking(docRef);
    return { success: true, message: 'Produto excluído com sucesso.' };
  } catch(e: any) {
    return { success: false, message: e.message || 'Ocorreu um erro ao excluir o produto.' };
  }
}
