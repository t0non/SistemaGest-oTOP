'use client';

import React from 'react';
import type { ServiceOrder } from '@/lib/definitions';
import { formatCPF } from '@/lib/formatters';

interface PrintableOrderProps {
  data: ServiceOrder;
}

export const PrintableOrder = React.forwardRef<HTMLDivElement, PrintableOrderProps>(
  ({ data = {} as ServiceOrder }, ref) => {
    const id = data.id || '000';
    const clientName = data.clientName || 'Consumidor';
    const entryDate = data.entryDate ? new Date(data.entryDate).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

    return (
        <div ref={ref} className="p-10 bg-white text-black font-sans w-[210mm] min-h-[297mm]">
        
        <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-center">
            <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://files.catbox.moe/rsv9g4.png" alt="TechStore BH Logo" style={{width: '180px'}} />
                <p className="text-sm mt-2">Assistência Técnica Especializada</p>
                <p className="text-sm mt-1">Rua Fictícia, 123 - Belo Horizonte, MG</p>
                <p className="text-sm">CNPJ: 00.000.000/0001-00 | Tel: (31) 99999-9999</p>
            </div>
            <div className="text-right">
                <h2 className="text-2xl font-bold uppercase">Recibo de Serviço</h2>
                <p className="text-lg font-bold">OS: #{id}</p>
            </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
            <p className="col-span-2"><strong>Data:</strong> {entryDate}</p>
            <div className="col-span-2">
                <p><strong>Cliente:</strong> {clientName}</p>
                {data.clientCpf && <p><strong>CPF:</strong> {formatCPF(data.clientCpf)}</p>}
            </div>
        </div>

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
                            <p className="font-bold">{data.equipment || 'N/A'}</p>
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
