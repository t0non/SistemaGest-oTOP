'use client';

import React, { useState, useEffect } from 'react';
import type { Transaction } from '@/lib/definitions';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

const formatDate = (dateString: string) => format(parseISO(dateString), "dd/MM/yyyy");
const formatPeriod = (dateString: string) => format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });

export const PrintableFinancialReport = React.forwardRef<HTMLDivElement, ReportProps>(
  ({ transactions, summary, startDate, endDate }, ref) => {
    const [generatedDate, setGeneratedDate] = useState('');

    useEffect(() => {
      // Gera a data apenas no lado do cliente, após a montagem do componente.
      setGeneratedDate(
        format(new Date(), "'dd 'de' MMMM 'de' yyyy', às ' HH:mm", { locale: ptBR })
      );
    }, []);
    
    return (
      <div ref={ref} className="bg-white text-black p-10 font-sans">
        <div className="w-[210mm] min-h-[297mm] mx-auto">
            {/* Cabeçalho */}
            <header className="flex justify-between items-center pb-4 border-b-2 border-gray-800">
                <div className="w-48">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://files.catbox.moe/rsv9g4.png" alt="TechStore BH Logo" className="w-full h-auto" />
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold uppercase">Relatório Financeiro</h1>
                    <p className="text-sm text-gray-600">
                        Período de {formatPeriod(startDate)} a {formatPeriod(endDate)}
                    </p>
                </div>
            </header>

            {/* Resumo */}
            <section className="my-8">
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">Resumo do Período</h2>
                <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800 font-semibold">Total de Entradas</p>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.revenue)}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800 font-semibold">Total de Saídas</p>
                        <p className="text-2xl font-bold text-red-700">{formatCurrency(summary.expenses)}</p>
                    </div>
                     <div className={cn("p-4 rounded-lg border", summary.profit >= 0 ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200")}>
                        <p className={cn("text-sm font-semibold", summary.profit >= 0 ? "text-blue-800" : "text-red-800")}>Saldo Líquido</p>
                        <p className={cn("text-2xl font-bold", summary.profit >= 0 ? "text-blue-700" : "text-red-700")}>{formatCurrency(summary.profit)}</p>
                    </div>
                </div>
            </section>

            {/* Tabela de Transações */}
            <section>
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-300 pb-2">Transações Detalhadas</h2>
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left w-24">Data</th>
                            <th className="border p-2 text-left">Descrição</th>
                            <th className="border p-2 text-left w-28">Tipo</th>
                            <th className="border p-2 text-right w-40">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? transactions.map(t => (
                            <tr key={t.id} className="even:bg-gray-50">
                                <td className="border p-2">{formatDate(t.date)}</td>
                                <td className="border p-2">{t.description}</td>
                                <td className={cn("border p-2 font-medium", t.type === 'income' ? 'text-green-600' : 'text-red-600')}>
                                    {t.type === 'income' ? 'Entrada' : 'Saída'}
                                </td>
                                <td className={cn("border p-2 text-right font-mono", t.type === 'income' ? 'text-green-700' : 'text-red-700')}>
                                    {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-gray-500">Nenhuma transação encontrada no período.</td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold bg-gray-100">
                           <td colSpan={3} className="border p-2 text-right">Total Entradas:</td>
                           <td className="border p-2 text-right font-mono text-green-700">{formatCurrency(summary.revenue)}</td>
                        </tr>
                         <tr className="font-bold bg-gray-100">
                           <td colSpan={3} className="border p-2 text-right">Total Saídas:</td>
                           <td className="border p-2 text-right font-mono text-red-700">{formatCurrency(summary.expenses)}</td>
                        </tr>
                         <tr className="font-bold bg-gray-200 text-base">
                           <td colSpan={3} className="border p-2 text-right">Saldo Líquido Final:</td>
                           <td className={cn("border p-2 text-right font-mono", summary.profit >= 0 ? "text-blue-700" : "text-red-700")}>{formatCurrency(summary.profit)}</td>
                        </tr>
                    </tfoot>
                </table>
            </section>
            
            {/* Rodapé */}
            <footer className="text-center text-xs text-gray-500 pt-8 mt-auto">
                {generatedDate && <p>Relatório gerado em {generatedDate}</p>}
                <p>TechStore Manager BH</p>
            </footer>
        </div>
      </div>
    );
  }
);

PrintableFinancialReport.displayName = 'PrintableFinancialReport';
