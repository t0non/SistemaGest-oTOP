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
  date: z.date(),
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
  data: Omit<Transaction, 'id' | 'date'> & { date: Date }
): { success: boolean; message?: string } {
  try {
    const validation = transactionSchema.safeParse(data);

    if (!validation.success) {
      console.error(validation.error.flatten());
      return { success: false, message: 'Dados de atualização inválidos.' };
    }

    const docRef = doc(db, 'transactions', id);
    // Firestore updates require plain objects, so we might need to adjust if 'date' is a custom object
    // For this schema, `date` is part of the validation but we might not want to update it.
    // If date update is not allowed, it should be removed from dataToUpdate.
    const { date: validatedDate, ...dataToUpdate } = validation.data;
    
    // Example: To avoid updating the date, but keep it for validation
    // const { date, ...dataToUpdate } = validation.data;
    
    // If you need to update the date, convert it to a Timestamp
    const finalData = {
        ...dataToUpdate,
        date: Timestamp.fromDate(validatedDate)
    };


    updateDocumentNonBlocking(docRef, finalData);

    return { success: true, message: 'Transação atualizada com sucesso.' };
  } catch (e: any) {
    return {
      success: false,
      message: e.message || 'Ocorreu um erro ao atualizar a transação.',
    };
  }
}

export function deleteTransaction(id: string): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve) => {
    try {
      const docRef = doc(db, 'transactions', id);
      deleteDocumentNonBlocking(docRef);
      resolve({ success: true, message: 'Transação excluída com sucesso.' });
    } catch (e: any) {
      console.error("Deletion error:", e);
      resolve({ success: false, message: e.message || 'Ocorreu um erro ao excluir a transação.' });
    }
  });
}