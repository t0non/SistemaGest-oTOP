
export type Client = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string;
};

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  clientId?: string;
  clientName?: string;
};

export const ServiceOrderStatus = [
  'Em Análise',
  'Aguardando Aprovação',
  'Em Manutenção',
  'Pronto para Retirada',
  'Finalizado/Entregue',
] as const;

export type ServiceOrderStatus = (typeof ServiceOrderStatus)[number];

export type ServiceOrder = {
    id: string;
    clientId: string;
    clientName: string;
    equipment: string;
    problemDescription?: string;
    entryDate: string;
    status: ServiceOrderStatus;
    notes?: string;
    finalValue?: number;
    clientCpf?: string; // Adicionado para impressão
};
