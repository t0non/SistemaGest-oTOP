import type {Client, Transaction} from './definitions';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'João da Silva',
    cpf: '123.456.789-00',
    phone: '(31) 99999-1234',
    address: 'Rua das Flores, 123, Belo Horizonte, MG',
    notes: 'Cliente antigo, prefere contato por WhatsApp.',
    createdAt: '2023-10-26T10:00:00Z',
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    cpf: '987.654.321-01',
    phone: '(31) 98888-5678',
    address: 'Avenida Principal, 456, Contagem, MG',
    notes: 'Indicada pelo João.',
    createdAt: '2023-10-25T14:30:00Z',
  },
  {
    id: '3',
    name: 'Carlos Pereira',
    cpf: '111.222.333-44',
    phone: '(31) 97777-4321',
    address: 'Rua da Passagem, 789, Betim, MG',
    createdAt: '2023-10-24T09:00:00Z',
  },
  {
    id: '4',
    name: 'Ana Costa',
    cpf: '444.555.666-77',
    phone: '(31) 96666-8765',
    address: 'Praça da Liberdade, 101, Belo Horizonte, MG',
    notes: 'Sempre pede urgência.',
    createdAt: '2023-10-23T18:00:00Z',
  },
];

const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'income',
    description: 'Formatação de Notebook Dell',
    amount: 150.0,
    date: new Date(firstDayOfMonth.setDate(2)).toISOString(),
    clientId: '1',
    clientName: 'João da Silva',
  },
  {
    id: 't2',
    type: 'expense',
    description: 'Compra de SSD 512GB',
    amount: 250.0,
    date: new Date(firstDayOfMonth.setDate(3)).toISOString(),
  },
  {
    id: 't3',
    type: 'income',
    description: 'Troca de tela iPhone 12',
    amount: 450.0,
    date: new Date(firstDayOfMonth.setDate(5)).toISOString(),
    clientId: '2',
    clientName: 'Maria Oliveira',
  },
  {
    id: 't4',
    type: 'income',
    description: 'Venda de Carregador Turbo',
    amount: 80.0,
    date: new Date(firstDayOfMonth.setDate(10)).toISOString(),
  },
  {
    id: 't5',
    type: 'expense',
    description: 'Aluguel da loja',
    amount: 1200.0,
    date: new Date(firstDayOfMonth.setDate(10)).toISOString(),
  },
    {
    id: 't6',
    type: 'expense',
    description: 'Conta de luz',
    amount: 350.0,
    date: new Date(firstDayOfMonth.setDate(15)).toISOString(),
  },
  {
    id: 't7',
    type: 'income',
    description: 'Limpeza e manutenção de PC Gamer',
    amount: 250.0,
    date: new Date(firstDayOfMonth.setDate(18)).toISOString(),
    clientId: '3',
    clientName: 'Carlos Pereira',
  },
];
