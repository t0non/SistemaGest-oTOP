'use client';

import { z } from 'zod';
import type { Client } from '@/lib/definitions';

const clientSchema = z.object({
  name: z.string(),
  cpf: z.string(),
  phone: z.string(),
  address: z.string(),
  notes: z.string().optional(),
});

type ActionResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

const getClientsFromStorage = (): Client[] => {
  if (typeof window === 'undefined') return [];
  const storedClients = localStorage.getItem('clients');
  return storedClients ? JSON.parse(storedClients) : [];
};

const saveClientsToStorage = (clients: Client[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('clients', JSON.stringify(clients));
};

export function getClients(query: string): Client[] {
  let clients = getClientsFromStorage();
  if (!query) {
    return clients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  const lowercasedQuery = query.toLowerCase();
  return clients.filter(
    (client) =>
      client.name.toLowerCase().includes(lowercasedQuery) ||
      client.cpf.includes(lowercasedQuery)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addClient(
  data: z.infer<typeof clientSchema>
): ActionResponse {
  const validation = clientSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, message: 'Dados inválidos.' };
  }

  let clients = getClientsFromStorage();
  const newClient: Client = {
    id: `client-${Date.now()}`,
    ...validation.data,
    createdAt: new Date().toISOString(),
  };

  clients.unshift(newClient);
  saveClientsToStorage(clients);
  return { success: true, message: 'Cliente adicionado com sucesso.', data: newClient };
}

export function updateClient(
  id: string,
  data: z.infer<typeof clientSchema>
): ActionResponse {
  const validation = clientSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: 'Dados inválidos.' };
  }

  let clients = getClientsFromStorage();
  const clientIndex = clients.findIndex((c) => c.id === id);
  if (clientIndex === -1) {
    return { success: false, message: 'Cliente não encontrado.' };
  }

  const updatedClient = { ...clients[clientIndex], ...validation.data };
  clients[clientIndex] = updatedClient;
  saveClientsToStorage(clients);
  return { success: true, message: 'Cliente atualizado com sucesso.', data: updatedClient };
}

export function deleteClient(id: string): ActionResponse {
  let clients = getClientsFromStorage();
  const clientIndex = clients.findIndex((c) => c.id === id);
  if (clientIndex === -1) {
    return { success: false, message: 'Cliente não encontrado.' };
  }

  clients.splice(clientIndex, 1);
  saveClientsToStorage(clients);
  return { success: true, message: 'Cliente excluído com sucesso.' };
}
