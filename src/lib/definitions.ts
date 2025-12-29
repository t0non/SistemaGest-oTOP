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
