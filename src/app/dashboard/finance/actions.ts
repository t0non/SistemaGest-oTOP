'use client';

import type {Transaction, TransactionOwner} from '@/lib/definitions';
import {isSameMonth, parseISO} from 'date-fns';
import { z } from 'zod';

const getTransactionsFromStorage = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('transactions');
  try {
    const parsed = stored ? JSON.parse(stored) : [];
    // Adiciona valor default para transações antigas
    return parsed.map((t: any) => ({ ...t, owner: t.owner || 'admin' }));
  } catch (e) {
    return [];
  }
};

const saveTransactionsToStorage = (transactions: Transaction[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('transactions', JSON.stringify(transactions));
  window.dispatchEvent(new Event('local-storage-changed')); // Notify other components
};

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  description: z.string().min(3, { message: 'A descrição é obrigatória.' }),
  amount: z.number().positive({ message: 'O valor deve ser maior que zero.' }),
  owner: z.enum(['admin', 'pedro', 'split']),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
});


export function getTransactions(): Transaction[] {
  const transactions = getTransactionsFromStorage();
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getMonthlyFinancialSummary(): {
  revenue: number;
  expenses: number;
  profit: number;
  productsSold: number;
  adminProfit: number;
  pedroProfit: number;
} {
  const transactions = getTransactionsFromStorage();
  const today = new Date();

  const monthlyTransactions = transactions.filter((t) =>
    isSameMonth(parseISO(t.date), today)
  );

  let revenue = 0;
  let expenses = 0;
  let adminProfit = 0;
  let pedroProfit = 0;

  monthlyTransactions.forEach((t) => {
    if (t.type === 'income') {
      revenue += t.amount;
      if (t.owner === 'admin') {
        adminProfit += t.amount;
      } else if (t.owner === 'pedro') {
        pedroProfit += t.amount;
      } else if (t.owner === 'split') {
        adminProfit += t.amount / 2;
        pedroProfit += t.amount / 2;
      }
    } else { // expense
      expenses += t.amount;
      if (t.owner === 'admin') {
        adminProfit -= t.amount;
      } else if (t.owner === 'pedro') {
        pedroProfit -= t.amount;
      } else if (t.owner === 'split') {
        adminProfit -= t.amount / 2;
        pedroProfit -= t.amount / 2;
      }
    }
  });


  const profit = revenue - expenses;
  const productsSold = monthlyTransactions.filter((t) => t.type === 'income').length;

  return {revenue, expenses, profit, productsSold, adminProfit, pedroProfit};
}

export function addTransaction(data: Omit<Transaction, 'id' | 'date'>): {success: boolean; message?: string;} {
    try {
        const validation = transactionSchema.safeParse(data);
        if (!validation.success) {
          console.log(validation.error);
          return { success: false, message: 'Dados inválidos.' };
        }
        
        let transactions = getTransactionsFromStorage();
        const newTransaction: Transaction = {
            id: `t-${Date.now()}`,
            date: new Date().toISOString(),
            ...validation.data
        };
        transactions.unshift(newTransaction);
        saveTransactionsToStorage(transactions);
        return { success: true, message: "Transação adicionada com sucesso." };
    } catch(e) {
        return { success: false, message: "Ocorreu um erro ao adicionar a transação." };
    }
}

export function updateTransaction(id: string, data: Omit<Transaction, 'id' | 'date'>): {success: boolean; message?: string;} {
    try {
        const validation = transactionSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, message: 'Dados de atualização inválidos.' };
        }
        
        let transactions = getTransactionsFromStorage();
        const transactionIndex = transactions.findIndex(t => t.id === id);

        if (transactionIndex === -1) {
            return { success: false, message: 'Transação não encontrada.' };
        }

        const updatedTransaction = {
            ...transactions[transactionIndex],
            ...validation.data
        };
        
        transactions[transactionIndex] = updatedTransaction;
        saveTransactionsToStorage(transactions);
        return { success: true, message: "Transação atualizada com sucesso." };

    } catch (e) {
        return { success: false, message: "Ocorreu um erro ao atualizar a transação." };
    }
}

export function deleteTransaction(id: string): {success: boolean; message?: string;} {
    try {
        let transactions = getTransactionsFromStorage();
        const updatedTransactions = transactions.filter(t => t.id !== id);

        if (transactions.length === updatedTransactions.length) {
            return { success: false, message: 'Transação não encontrada.' };
        }

        saveTransactionsToStorage(updatedTransactions);
        return { success: true, message: "Transação excluída com sucesso." };
    } catch (e) {
        return { success: false, message: "Ocorreu um erro ao excluir a transação." };
    }
}
