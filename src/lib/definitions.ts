import { Timestamp } from "firebase/firestore";

export type Client = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string | Timestamp; // ISO String, mas pode vir como Timestamp do Firestore
};

export const TransactionOwner = ['admin', 'pedro', 'split'] as const;
export type TransactionOwner = (typeof TransactionOwner)[number];

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: Date | Timestamp;
  owner: TransactionOwner;
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

export type ServiceOrderItem = {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
};

export type ServiceOrder = {
    id: string;
    clientId: string;
    clientName: string;
    equipment: string;
    problemDescription?: string;
    entryDate: string | Timestamp;
    status: ServiceOrderStatus;
    notes?: string;
    finalValue?: number;
    clientCpf?: string; // Adicionado para impressão
    items?: ServiceOrderItem[];
    createdAt?: string | Timestamp;
};

export type Product = {
  id: string;
  name: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  supplierName?: string;
  supplierPhone?: string;
  createdAt: string | Timestamp;
};
