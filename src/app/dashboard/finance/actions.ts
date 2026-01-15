'use client';

import {
  collection,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  where,
  getDocs,
} from 'firebase/firestore';
import { z } from 'zod';
import type { Transaction } from '@/lib/definitions';
import { db } from '@/firebase/config';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  description: z.string().min(3, { message: 'A descrição é obrigatória.' }),
  amount: z.number().positive({ message: 'O valor deve ser maior que zero.' }),
  owner: z.enum(['admin', 'pedro', 'split']),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  date: z.instanceof(Date),
});

export function addTransaction(
  data: Partial<Omit<Transaction, 'id'>>
): { success: boolean; message?: string } {
  try {
    const date = data.date ? new Date(data.date) : new Date();
    const validation = transactionSchema.safeParse({ ...data, date });

    if (!validation.success) {
      console.error(validation.error.flatten());
      return { success: false, message: 'Dados inválidos.' };
    }

    const dataToSave = {
      ...validation.data,
      date: Timestamp.fromDate(validation.data.date),
    };

    addDocumentNonBlocking(collection(db, 'transactions'), dataToSave);

    return { success: true, message: 'Transação adicionada com sucesso.' };
  } catch (e: any) {
    return {
      success: false,
      message: e.message || 'Ocorreu um erro ao adicionar a transação.',
    };
  }
}

export function updateTransaction(
  id: string,
  data: Omit<Transaction, 'id' | 'date'>
): { success: boolean; message?: string } {
  try {
    const date = new Date(); // Date is not updated, but needed for validation
    const validation = transactionSchema.safeParse({ ...data, date });

    if (!validation.success) {
      console.error(validation.error.flatten());
      return { success: false, message: 'Dados de atualização inválidos.' };
    }

    const docRef = doc(db, 'transactions', id);
    const { date: _, ...dataToUpdate } = validation.data; // Remove date from update data

    updateDocumentNonBlocking(docRef, dataToUpdate);

    return { success: true, message: 'Transação atualizada com sucesso.' };
  } catch (e: any) {
    return {
      success: false,
      message: 'Ocorreu um erro ao atualizar a transação.',
    };
  }
}

export function deleteTransaction(id: string): Promise<{ success: boolean, message?: string }> {
  return new Promise((resolve) => {
      try {
          const docRef = doc(db, 'transactions', id);
          deleteDocumentNonBlocking(docRef);
          resolve({ success: true, message: 'Transação excluída com sucesso.' });
      } catch (e: any) {
          resolve({ success: false, message: e.message || 'Ocorreu um erro ao excluir a transação.' });
      }
  });
}
