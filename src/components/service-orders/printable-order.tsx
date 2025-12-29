'use client';

import React from 'react';
import type { ServiceOrder } from '@/lib/definitions';
import { formatCPF } from '@/lib/formatters';

// Estendendo o tipo para incluir o CPF opcional
interface PrintableServiceOrder extends ServiceOrder {
  clientCpf?: string;
}

interface PrintableOrderProps {
  data: PrintableServiceOrder;
}

export const PrintableOrder = React.forwardRef<HTMLDivElement, PrintableOrderProps>(
  ({ data }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black font-sans hidden print:block">
        {/* Cabeçalho */}
        <div className="border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase">TechStore BH</h1>
          <p className="text-sm text-gray-600">Assistência Técnica Especializada</p>
          <p className="text-sm mt-1">Rua Fictícia, 123 - Belo Horizonte, MG</p>
          <p className="text-sm">CNPJ: 00.000.000/0001-00 | Tel: (31) 99999-9999</p>
        </div>

        {/* Dados da OS */}
        <div className="mb-6">
          <h2 className="text-lg font-bold border-b border-gray-200 mb-2">Detalhes do Pedido</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Nº da OS:</span> {data.id}
            </div>
            <div>
              <span className="font-semibold">Data:</span> {new Date(data.entryDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-100">
          <h2 className="text-lg font-bold mb-2">Cliente</h2>
          <p><span className="font-semibold">Nome:</span> {data.clientName}</p>
          {data.clientCpf && <p><span className="font-semibold">CPF:</span> {formatCPF(data.clientCpf)}</p>}
        </div>

        {/* Equipamento e Serviço */}
        <div className="mb-8">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="py-2">Descrição / Serviço</th>
                <th className="py-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-3">
                  <p className="font-bold">{data.equipment}</p>
                  <p className="text-gray-500">{data.problemDescription || 'Manutenção e reparos diversos.'}</p>
                </td>
                <td className="py-3 text-right font-bold">
                  R$ {Number(data.finalValue || 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-4 text-right font-bold text-lg">TOTAL A PAGAR:</td>
                <td className="pt-4 text-right font-bold text-lg">
                  R$ {Number(data.finalValue || 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Termos e Assinatura */}
        <div className="mt-12 pt-8 border-t-2 border-gray-300 text-center">
          <p className="text-xs text-gray-500 mb-8 text-justify">
            GARANTIA: A garantia é de 90 dias para mão de obra e peças substituídas, contados a partir da data de retirada. 
            Não cobrimos mau uso, danos físicos, líquidos ou vírus. Equipamentos não retirados em 90 dias serão descartados.
          </p>
          
          <div className="flex justify-between mt-16 px-8">
            <div className="border-t border-black w-5/12 pt-2">
              <p className="text-sm">Assinatura TechStore BH</p>
            </div>
            <div className="border-t border-black w-5/12 pt-2">
              <p className="text-sm">Assinatura do Cliente</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintableOrder.displayName = 'PrintableOrder';
