'use client';

import React, { forwardRef } from 'react';
import type { ServiceOrder } from '@/lib/definitions';
import { formatCPF } from '@/lib/formatters';
import { Timestamp } from 'firebase/firestore';

interface PrintableQuoteProps {
    data: ServiceOrder;
}

export const PrintableQuote = forwardRef<HTMLDivElement, PrintableQuoteProps>(
  ({ data = {} as ServiceOrder }, ref) => {
    const id = data.id || "0000";
    const clientName = data.clientName || "Consumidor Final";
    const date = data.entryDate 
      ? (data.entryDate as Timestamp).toDate().toLocaleDateString('pt-BR') 
      : new Date().toLocaleDateString('pt-BR');
    
    const items = data.items || [{
        id: 'default',
        description: `${data.equipment || 'Equipamento'} - ${data.problemDescription || 'Serviço de Manutenção'}`,
        quantity: 1,
        unitPrice: data.finalValue || 0
    }];

    const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    const emptyRowsCount = Math.max(0, 10 - items.length);
    const emptyRows = Array(emptyRowsCount).fill(null);

    return (
      <div ref={ref} className="bg-white text-black font-sans w-[210mm] min-h-[297mm] p-10 relative text-sm">
        
        {/* CABEÇALHO */}
        <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
            <div>
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://files.catbox.moe/rsv9g4.png" alt="TechStore BH Logo" style={{width: '200px'}} />
                <p className="text-xs text-gray-600 mt-1">Assistência Técnica Especializada</p>
            </div>
            <div className="text-right">
                <h2 className="text-2xl font-bold uppercase">Orçamento</h2>
                <p className="text-lg font-bold">Nº {id.slice(0, 6)}</p>
                <p className="text-sm">Data: {date}</p>
            </div>
        </div>

        {/* DADOS DO CLIENTE */}
        <div className="border border-black p-2 mb-4">
            <p><span className="font-bold">CLIENTE:</span> {clientName}</p>
            {data.clientCpf && <p className="mt-1"><span className="font-bold">CPF/CNPJ:</span> {formatCPF(data.clientCpf)}</p>}
        </div>

        {/* TABELA DE ITENS */}
        <table className="w-full border-collapse border border-black mb-4 text-xs">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border border-black p-1 w-12 text-center">QTD</th>
                    <th className="border border-black p-1 text-left">DESCRIÇÃO</th>
                    <th className="border border-black p-1 w-24 text-right">PREÇO UN.</th>
                    <th className="border border-black p-1 w-24 text-right">TOTAL</th>
                </tr>
            </thead>
            <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                      <td className="border border-black p-1 text-center">{item.quantity}</td>
                      <td className="border border-black p-1">{item.description}</td>
                      <td className="border border-black p-1 text-right">R$ {Number(item.unitPrice).toFixed(2)}</td>
                      <td className="border border-black p-1 text-right">R$ {Number(item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
                {/* Linhas Vazias para preencher o papel */}
                {emptyRows.map((_, i) => (
                    <tr key={`empty-${i}`} className="h-6">
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan={2} rowSpan={3} className="border border-black p-2 align-top text-[10px] text-justify">
                        <strong>Normas e Procedimentos:</strong><br/>
                        Prazo de validade deste orçamento é de 15 dias. 
                        Garantia de 90 dias para peças e mão de obra. 
                        Não cobrimos mal uso ou danos físicos após entrega.
                    </td>
                    <td className="border border-black p-1 font-bold text-right">MATERIAL</td>
                    <td className="border border-black p-1 text-right">R$ 0,00</td>
                </tr>
                <tr>
                    <td className="border border-black p-1 font-bold text-right">MÃO DE OBRA</td>
                    <td className="border border-black p-1 text-right">R$ {totalValue.toFixed(2)}</td>
                </tr>
                <tr>
                    <td className="border border-black p-1 font-bold text-right bg-gray-200">TOTAL R$</td>
                    <td className="border border-black p-1 font-bold text-right bg-gray-200">R$ {totalValue.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>

        {/* RODAPÉ E ASSINATURA */}
        <div className="mt-16 text-center">
            <h3 className="font-bold mb-12">AGRADECEMOS A PREFERÊNCIA!</h3>
            
            <div className="border border-black p-4 text-left text-xs flex justify-between items-end">
                <div>
                    <p>Endereço: Rua Tupis, 449 - Centro - BH</p>
                    <p>Tel: (31) 9911-3393</p>
                    <p>Email: contato@topinfobh.com.br</p>
                    <p>Instagram: @topinfobh</p>
                </div>
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://files.catbox.moe/rsv9g4.png" alt="TechStore BH Logo" style={{width: '150px'}} />
            </div>
        </div>

      </div>
    );
  }
);
PrintableQuote.displayName = 'PrintableQuote';
