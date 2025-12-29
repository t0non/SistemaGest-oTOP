'use server';

import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {mockClients} from '@/lib/mock-data';
import type {Client} from '@/lib/definitions';

// Mock database
let clients: Client[] = [...mockClients];

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
};

// Simulate network delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getClients(query: string): Promise<Client[]> {
  await delay(500); // Simulate DB query time

  // In a real app, you would query Firestore here.
  // e.g., const q = query(collection(db, 'clients'), where('name', '>=', query), ...);
  // const querySnapshot = await getDocs(q);
  // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));

  if (!query) {
    return clients;
  }

  const lowercasedQuery = query.toLowerCase();
  return clients.filter(
    (client) =>
      client.name.toLowerCase().includes(lowercasedQuery) ||
      client.cpf.includes(lowercasedQuery)
  );
}

export async function addClient(
  data: z.infer<typeof clientSchema>
): Promise<ActionResponse> {
  await delay(1000);
  const validation = clientSchema.safeParse(data);

  if (!validation.success) {
    return {success: false, message: 'Dados inválidos.'};
  }
  // In a real app, you would use addDoc to add to Firestore
  // await addDoc(collection(db, 'clients'), newClientData);
  const newClient: Client = {
    id: (clients.length + 1).toString(),
    ...validation.data,
    createdAt: new Date().toISOString(),
  };

  clients.unshift(newClient);
  revalidatePath('/dashboard/clients');
  return {success: true, message: 'Cliente adicionado com sucesso.'};
}

export async function updateClient(
  id: string,
  data: z.infer<typeof clientSchema>
): Promise<ActionResponse> {
  await delay(1000);
  const validation = clientSchema.safeParse(data);
  if (!validation.success) {
    return {success: false, message: 'Dados inválidos.'};
  }

  // In a real app, you would use updateDoc in Firestore
  // const clientRef = doc(db, 'clients', id);
  // await updateDoc(clientRef, data);

  const clientIndex = clients.findIndex((c) => c.id === id);
  if (clientIndex === -1) {
    return {success: false, message: 'Cliente não encontrado.'};
  }

  clients[clientIndex] = {...clients[clientIndex], ...validation.data};
  revalidatePath('/dashboard/clients');
  return {success: true, message: 'Cliente atualizado com sucesso.'};
}

export async function deleteClient(id: string): Promise<ActionResponse> {
  await delay(1000);
  // In a real app, you would use deleteDoc in Firestore
  // await deleteDoc(doc(db, 'clients', id));

  const clientIndex = clients.findIndex((c) => c.id === id);
  if (clientIndex === -1) {
    return {success: false, message: 'Cliente não encontrado.'};
  }

  clients.splice(clientIndex, 1);
  revalidatePath('/dashboard/clients');
  return {success: true, message: 'Cliente excluído com sucesso.'};
}
