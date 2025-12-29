'use client';

import type {Transaction} from '@/lib/definitions';
import {isSameMonth, parseISO} from 'date-fns';

const getTransactionsFromStorage = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('transactions');
  try {
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const saveTransactionsToStorage = (transactions: Transaction[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('transactions', JSON.stringify(transactions));
  window.dispatchEvent(new Event('local-storage-changed')); // Notify other components
};


export function getTransactions(): Transaction[] {
  const transactions = getTransactionsFromStorage();
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getMonthlyFinancialSummary(): {
  revenue: number;
  expenses: number;
  profit: number;
  productsSold: number;
} {
  const transactions = getTransactionsFromStorage();
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

  const productsSold = monthlyTransactions.filter((t) => t.type === 'income').length;

  return {revenue, expenses, profit, productsSold};
}

export function addTransaction(data: Omit<Transaction, 'id' | 'date'>): {success: boolean; message?: string;} {
    try {
        let transactions = getTransactionsFromStorage();
        const newTransaction: Transaction = {
            id: `t-${Date.now()}`,
            date: new Date().toISOString(),
            ...data
        };
        transactions.unshift(newTransaction);
        saveTransactionsToStorage(transactions);
        return { success: true, message: "Transação adicionada com sucesso." };
    } catch(e) {
        return { success: false, message: "Ocorreu um erro ao adicionar a transação." };
    }
}
