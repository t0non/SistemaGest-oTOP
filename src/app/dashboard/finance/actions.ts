'use server';

import {mockTransactions} from '@/lib/mock-data';
import type {Transaction} from '@/lib/definitions';
import {isSameMonth, parseISO, startOfMonth} from 'date-fns';
import { revalidatePath } from 'next/cache';

// Mock database
let transactions: Transaction[] = [...mockTransactions];

// Simulate network delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getTransactions(): Promise<Transaction[]> {
  await delay(300);
  // In a real app, you would fetch from Firestore, probably ordered by date
  // const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getMonthlyFinancialSummary(): Promise<{
  revenue: number;
  expenses: number;
  profit: number;
}> {
  await delay(300);
  const today = new Date();

  const monthlyTransactions = transactions.filter((t) =>
    isSameMonth(parseISO(t.date), today)
  );

  const revenue = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = revenue - expenses;

  return {revenue, expenses, profit};
}

export async function addTransaction(data: Omit<Transaction, 'id' | 'date'>): Promise<{success: boolean; message?: string;}> {
    await delay(1000);
    
    try {
        const newTransaction: Transaction = {
            id: `t${transactions.length + 1}`,
            date: new Date().toISOString(),
            ...data
        };
        transactions.unshift(newTransaction);
        revalidatePath('/dashboard/finance');
        revalidatePath('/dashboard');
        return { success: true, message: "Transação adicionada com sucesso." };
    } catch(e) {
        return { success: false, message: "Ocorreu um erro ao adicionar a transação." };
    }
}