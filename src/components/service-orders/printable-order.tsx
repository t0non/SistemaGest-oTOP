
'use client';

import React from 'react';
import type { ServiceOrder, Client } from '@/lib/definitions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Building } from 'lucide-react';
import { formatCPF } from '@/lib/formatters';

interface PrintableOrderProps {
  order: ServiceOrder;
  client: Client;
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
};


export const PrintableOrder = React.forwardRef<HTMLDivElement, PrintableOrderProps>(
  ({ order, client }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black font-sans text-sm">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start pb-4 border-b border-gray-400">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-200 flex items-center justify-center">
                <Building className="w-10 h-10 text-gray-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">TopInfoBH</h1>
              <p>Soluções em Tecnologia</p>
            </div>
          </div>
          <div className="text-right">
            <p>Rua Fictícia, 123 - Centro, Belo Horizonte - MG</p>
            <p>CNPJ: 00.000.000/0001-00</p>
            <p>Telefone: (31) 9999-8888 | E-mail: contato@topinfobh.com</p>
          </div>
        </div>

        {/* Número da OS e Data */}
        <div className="flex justify-between items-center py-4">
            <h2 className="text-xl font-bold">Ordem de Serviço / Recibo</h2>
            <div>
                <p><span className="font-semibold">Número da OS:</span> {order.id}</p>
                <p><span className="font-semibold">Data de Emissão:</span> {formatDate(new Date().toISOString())}</p>
            </div>
        </div>

        {/* Dados do Cliente */}
        <div className="border-t border-b border-gray-300 py-4 my-4">
            <h3 className="font-bold text-base mb-2">Dados do Cliente</h3>
            <p><span className="font-semibold">Nome:</span> {client.name}</p>
            <p><span className="font-semibold">CPF:</span> {formatCPF(client.cpf)}</p>
            <p><span className="font-semibold">Endereço:</span> {client.address}</p>
            <p><span className="font-semibold">Telefone:</span> {client.phone}</p>
        </div>

        {/* Tabela de Itens/Serviços */}
        <div>
            <h3 className="font-bold text-base mb-2">Itens e Serviços</h3>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-400">
                        <th className="py-2">Descrição</th>
                        <th className="text-center">Qtd.</th>
                        <th className="text-right">Valor Unit.</th>
                        <th className="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-300">
                        <td className="py-2">
                           <p className="font-semibold">{order.equipment}</p>
                           <p className="text-xs text-gray-600">Defeito reclamado: {order.problemDescription || 'Não especificado'}</p>
                           {order.notes && <p className="text-xs text-gray-600">Laudo Técnico: {order.notes}</p>}
                        </td>
                        <td className="text-center">1</td>
                        <td className="text-right">{formatCurrency(order.finalValue || 0)}</td>
                        <td className="text-right">{formatCurrency(order.finalValue || 0)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        {/* Resumo Financeiro */}
        <div className="flex justify-end mt-4">
            <div className="w-1/3">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(order.finalValue || 0)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Descontos:</span>
                    <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-gray-400 mt-2 pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(order.finalValue || 0)}</span>
                </div>
                 <div className="flex justify-between text-sm mt-1">
                    <span>Forma de Pagamento:</span>
                    <span>(A ser preenchido)</span>
                </div>
            </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-xs">
            <div className="mb-4">
                <h4 className="font-bold mb-1">Observações</h4>
                <p>Computador entregue com os periféricos descritos na entrada (se houver).</p>
            </div>
             <div className="mb-8">
                <h4 className="font-bold mb-1">Termo de Garantia</h4>
                <p>Garantia de 90 dias para serviços de mão de obra e peças substituídas, contados a partir da data de emissão deste recibo. A garantia não cobre danos por mau uso, quedas, líquidos ou surtos elétricos.</p>
            </div>
            <div className="flex justify-around mt-16">
                <div className="text-center w-1/2">
                    <p className="border-t border-gray-500 mx-8 pt-2">Assinatura do Técnico</p>
                </div>
                <div className="text-center w-1/2">
                    <p className="border-t border-gray-500 mx-8 pt-2">Assinatura do Cliente</p>
                </div>
            </div>
        </div>

      </div>
    );
  }
);

PrintableOrder.displayName = 'PrintableOrder';
