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
import { db } from '@/lib/firebase';
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

export async function getMonthlyFinancialSummary(): Promise<{
  revenue: number;
  expenses: number;
  profit: number;
  productsSold: number;
  adminProfit: number;
  pedroProfit: number;
}> {
  const transactionsCol = collection(db, 'transactions');
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const q = query(transactionsCol, where('date', '>=', startOfMonth), where('date', '<=', endOfMonth));
  
  const querySnapshot = await getDocs(q);
  const monthlyTransactions: Transaction[] = querySnapshot.docs.map(doc => {
    const data = doc.data();
    // Convert Firestore Timestamp to JS Date
    const date = (data.date as unknown as Timestamp)?.toDate ? (data.date as unknown as Timestamp).toDate() : new Date();
    return { id: doc.id, ...data, date } as Transaction;
  });

  let revenue = 0;
  let expenses = 0;
  let adminProfit = 0;
  let pedroProfit = 0;

  monthlyTransactions.forEach((t) => {
    const transactionAmount = Number(t.amount) || 0;
    if (t.type === 'income') {
      revenue += transactionAmount;
      if (t.owner === 'admin') {
        adminProfit += transactionAmount;
      } else if (t.owner === 'pedro') {
        pedroProfit += transactionAmount;
      } else if (t.owner === 'split') {
        adminProfit += transactionAmount / 2;
        pedroProfit += transactionAmount / 2;
      }
    } else { // expense
      expenses += transactionAmount;
      if (t.owner === 'admin') {
        adminProfit -= transactionAmount;
      } else if (t.owner === 'pedro') {
        pedroProfit -= transactionAmount;
      } else if (t.owner === 'split') {
        adminProfit -= transactionAmount / 2;
        pedroProfit -= transactionAmount / 2;
      }
    }
  });

  const profit = revenue - expenses;
  const productsSold = monthlyTransactions.filter((t) => t.type === 'income').length;

  return {revenue, expenses, profit, productsSold, adminProfit, pedroProfit};
}


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
  } catch (e) {
    return {
      success: false,
      message: 'Ocorreu um erro ao adicionar a transação.',
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
  } catch (e) {
    return {
      success: false,
      message: 'Ocorreu um erro ao atualizar a transação.',
    };
  }
}

export function deleteTransaction(
  id: string
): { success: boolean; message?: string } {
  try {
    const docRef = doc(db, 'transactions', id);
    deleteDocumentNonBlocking(docRef);
    return { success: true, message: 'Transação excluída com sucesso.' };
  } catch (e) {
    return {
      success: false,
      message: 'Ocorreu um erro ao excluir a transação.',
    };
  }
}
