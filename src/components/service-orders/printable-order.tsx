'use client';

import React from 'react';
import type { ServiceOrder } from '@/lib/definitions';
import { formatCPF } from '@/lib/formatters';

interface PrintableOrderProps {
  data: ServiceOrder;
}

export const PrintableOrder = React.forwardRef<HTMLDivElement, PrintableOrderProps>(
  ({ data = {} as ServiceOrder }, ref) => {
    const id = data.id || "0000";
    const clientName = data.clientName || "Consumidor Final";
    const date = data.entryDate ? new Date(data.entryDate).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
    
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
      <div ref={ref} className="bg-white text-black font-sans w-[210mm] min-h-[297mm] p-12 relative">
        
        {/* === CABEÇALHO === */}
        <div className="flex justify-between items-start mb-8">
            {/* Lado Esquerdo: LOGO */}
            <div className="pt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://files.catbox.moe/rsv9g4.png" alt="TechStore BH Logo" style={{width: '180px'}} />
            </div>

            {/* Lado Direito: Título e Dados */}
            <div className="text-right">
                <h2 className="text-3xl font-bold uppercase mb-2">SERVIÇO</h2>
                <div className="text-xl font-bold">N.º {id.slice(0, 6)}</div>
                <div className="text-sm font-semibold mt-1">DATA: {date}</div>
            </div>
        </div>

        {/* === CAIXA DO CLIENTE === */}
        <div className="border border-black p-2 mb-6">
            <p className="text-xs font-bold mb-1">CLIENTE</p>
            <p className="text-sm pl-2">Nome: <span className="font-normal text-base uppercase">{clientName}</span></p>
            {data.clientCpf && <p className="text-sm pl-2 mt-1">CPF: <span className="font-normal text-base">{formatCPF(data.clientCpf)}</span></p>}
        </div>

        {/* === TABELA === */}
        <table className="w-full border-collapse border border-black text-sm mb-2">
            <thead>
                <tr>
                    <th className="border border-black p-1 w-16 text-left">QTD</th>
                    <th className="border border-black p-1 text-left">DESCRIÇÃO</th>
                    <th className="border border-black p-1 w-32 text-left">PREÇO UNITÁRIO</th>
                    <th className="border border-black p-1 w-32 text-left">TOTAL</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <tr key={item.id} className="h-8">
                        <td className="border border-black p-1 px-2 align-top text-center">{item.quantity}</td>
                        <td className="border border-black p-1 px-2 align-top uppercase">{item.description}</td>
                        <td className="border border-black p-1 px-2 align-top">R$ {Number(item.unitPrice).toFixed(2)}</td>
                        <td className="border border-black p-1 px-2 align-top">R$ {Number(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                ))}

                {/* Linhas Vazias */}
                {emptyRows.map((_, index) => (
                    <tr key={index} className="h-8">
                        <td className="border border-black"></td>
                        <td className="border border-black bg-gray-50/30"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* === TOTAL === */}
        <div className="flex justify-end mb-6">
            <div className="flex items-center">
                <span className="font-bold mr-2 text-sm">TOTAL R$</span>
                <div className="border border-black w-32 h-10 flex items-center justify-end px-2 font-bold text-lg">
                    {Number(totalValue).toFixed(2)}
                </div>
            </div>
        </div>

        {/* === TERMOS E CONDIÇÕES === */}
        <div className="text-[10px] text-justify leading-tight mb-20 space-y-1">
            <p className="font-bold">Normas e Procedimentos</p>
            <p>
                <strong>Prazo de orçamento:</strong> O prazo de validade dos valores orçados é de 30 (trinta) dias contados de sua apresentação ao cliente.
            </p>
            <p>
                <strong>Garantia:</strong> O serviço Autorizado garante os serviços de assistência técnica prestados, nas mesmas condições da prestação do serviço anterior (a domicilio ou posto na empresa pelo consumidor). A garantia compreende a 1 ano das peças utilizadas e 90 dias da mão de obra, contados da entrega efetiva do produto.
            </p>
            <p>
                A garantia perde sua validade: Se houver utilização de rede elétrica imprópria, manutenção inadequada por técnico não autorizado e mal uso.
            </p>
        </div>

        {/* === RODAPÉ === */}
        <div className="text-center">
            <h3 className="font-bold text-sm uppercase mb-6">AGRADECEMOS A SUA PREFERÊNCIA!</h3>
            
            <div className="border border-black p-3 text-left text-[11px] flex justify-between items-center">
                <div className="space-y-0.5">
                    <p>Endereço: Rua Tupis n.449 Bairro: Centro</p>
                    <p>Telefone: (31) 9911-3393 Pedro Tonon CNPJ: 29.714.668/0001-82</p>
                    <p>Email: contato@topinfobh.com.br</p>
                    <p>Instagram: @topinfobh</p>
                </div>
                <div className="text-right">
                    <p>Site: www.TopInfoBH.com.br</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://files.catbox.moe/rsv9g4.png" alt="TechStore BH Logo" className="w-24 mt-2 ml-auto" />
                </div>
            </div>
        </div>

      </div>
    );
  }
);

PrintableOrder.displayName = 'PrintableOrder';
