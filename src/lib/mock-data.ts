
import type {Client, Transaction, ServiceOrder} from './definitions';

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'João da Silva',
    cpf: '123.456.789-00',
    phone: '31999991234',
    address: 'Rua das Flores, 123, Belo Horizonte, MG',
    notes: 'Cliente antigo, prefere contato por WhatsApp.',
    createdAt: '2023-10-26T10:00:00Z',
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    cpf: '987.654.321-01',
    phone: '31988885678',
    address: 'Avenida Principal, 456, Contagem, MG',
    notes: 'Indicada pelo João.',
    createdAt: '2023-10-25T14:30:00Z',
  },
  {
    id: '3',
    name: 'Carlos Pereira',
    cpf: '111.222.333-44',
    phone: '31977774321',
    address: 'Rua da Passagem, 789, Betim, MG',
    createdAt: '2023-10-24T09:00:00Z',
  },
  {
    id: '4',
    name: 'Ana Costa',
    cpf: '444.555.666-77',
    phone: '31966668765',
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


export const mockServiceOrders: ServiceOrder[] = [
  {
    id: 'OS-1023',
    clientId: '1',
    clientName: 'João da Silva',
    equipment: 'Notebook Dell Inspiron',
    entryDate: '2023-11-10T10:00:00Z',
    status: 'Pronto para Retirada',
    finalValue: 150,
    problemDescription: 'Notebook não liga, possível problema na fonte.',
  },
  {
    id: 'OS-1024',
    clientId: '2',
    clientName: 'Maria Oliveira',
    equipment: 'iPhone 12',
    entryDate: '2023-11-11T14:30:00Z',
    status: 'Em Manutenção',
    finalValue: 450,
    problemDescription: 'Tela quebrada após queda.',
  },
  {
    id: 'OS-1025',
    clientId: '4',
    clientName: 'Ana Costa',
    equipment: 'PC Gamer',
    entryDate: '2023-11-12T09:00:00Z',
    status: 'Aguardando Aprovação',
    problemDescription: 'Computador superaquecendo e desligando sozinho.',
  },
    {
    id: 'OS-1026',
    clientId: '3',
    clientName: 'Carlos Pereira',
    equipment: 'Macbook Air M1',
    entryDate: '2023-11-13T11:00:00Z',
    status: 'Em Análise',
    problemDescription: 'Teclado não responde algumas teclas.',
  },
  {
    id: 'OS-1027',
    clientId: '1',
    clientName: 'João da Silva',
    equipment: 'Samsung S21',
    entryDate: '2023-10-15T11:00:00Z',
    status: 'Finalizado/Entregue',
    finalValue: 200,
    problemDescription: 'Troca de conector de carga.',
  }
]
