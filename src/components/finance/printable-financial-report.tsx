'use client';

import React from 'react';
import type { Transaction } from '@/lib/definitions';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

interface ReportProps {
  transactions: Transaction[];
  summary: {
    revenue: number;
    expenses: number;
    profit: number;
  };
  startDate: string;
  endDate: string;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

const formatDate = (date: unknown) => {
    if (!date) return "Data inválida";
    try {
        if (date instanceof Timestamp) {
            return format(date.toDate(), "dd/MM/yyyy", { locale: ptBR });
        }
        if (date instanceof Date) {
            return format(date, "dd/MM/yyyy", { locale: ptBR });
        }
        if (typeof date === 'string') {
          const parsedDate = parseISO(date);
          if (!isNaN(parsedDate.getTime())) {
            return format(parsedDate, "dd/MM/yyyy", { locale: ptBR });
          }
        }
        return "Data inválida";
    } catch {
        return "Data inválida"
    }
};

const formatPeriod = (start: string, end: string) => {
    if (!start && !end) return 'Todo o Período';
    const formattedStart = start ? format(parseISO(start), 'dd/MM/yyyy', { locale: ptBR }) : 'Início';
    const formattedEnd = end ? format(parseISO(end), 'dd/MM/yyyy', { locale: ptBR }) : 'Fim';
    
    if (start && !end) return `A partir de ${formattedStart}`;
    if (!start && end) return `Até ${formattedEnd}`;
    if (start && end) return `${formattedStart} - ${formattedEnd}`;
    return 'Período inválido';
};


export const PrintableFinancialReport = ({ transactions, summary, startDate, endDate }: ReportProps) => {
    
    const ownerMap = {
      admin: 'Eduardo',
      pedro: 'Pedro',
      split: 'Dividido',
    };
    
    return (
      <div className="p-8 bg-white text-black print:p-0 w-full max-w-4xl mx-auto">
        {/* --- CABEÇALHO --- */}
        <div className="mb-8 border-b pb-4 flex justify-between items-end">
            <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://files.catbox.moe/rsv9g4.png" alt="TechStore BH Logo" className="w-48 h-auto" />
                <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-800 mt-4">Relatório Financeiro</h1>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-500">Período:</p>
                <p className="font-medium">{formatPeriod(startDate, endDate)}</p>
                <p className="text-sm text-gray-500 mt-2">Gerado em:</p>
                <p className="font-medium">{format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            </div>
        </div>

        {/* --- RESUMO FINANCEIRO (CARDS) --- */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="p-4 border rounded-lg bg-green-50">
            <p className="text-xs uppercase text-green-800 font-semibold mb-1">Total Entradas</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.revenue)}</p>
          </div>
          <div className="p-4 border rounded-lg bg-red-50">
            <p className="text-xs uppercase text-red-800 font-semibold mb-1">Total Saídas</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(summary.expenses)}</p>
          </div>
          <div className={`p-4 border rounded-lg ${summary.profit >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <p className={`text-xs uppercase font-semibold mb-1 ${summary.profit >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Saldo Líquido</p>
            <p className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              {formatCurrency(summary.profit)}
            </p>
          </div>
        </div>

        {/* --- TABELA DE TRANSAÇÕES --- */}
        <div className="overflow-hidden border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 w-24">Data</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Descrição</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700 w-28">Responsável</th>
                <th className="py-3 px-4 text-center font-semibold text-gray-700 w-24">Tipo</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700 w-32">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600 text-left">
                      {transaction.date ? formatDate(transaction.date) : '-'}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800 text-left">
                      {transaction.description}
                      {transaction.clientName && (
                        <span className="block text-xs text-gray-500 font-normal">{transaction.clientName}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-left">
                      {ownerMap[transaction.owner] || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-medium ${
                      transaction.type === 'income' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {transaction.type === 'expense' ? '-' : ''}
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                    Nenhuma transação encontrada neste período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- RODAPÉ --- */}
        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-400">
          <p>TechStore Manager BH</p>
        </div>
      </div>
    );
};
