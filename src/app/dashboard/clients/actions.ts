'use client';

import { z } from 'zod';
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Client } from '@/lib/definitions';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const clientSchema = z.object({
  name: z.string().min(3, {message: 'O nome deve ter pelo menos 3 caracteres.'}),
  cpf: z.string().optional(),
  phone: z.string().min(14, {message: 'O telefone deve ter pelo menos 10 caracteres.'}),
  address: z.string().optional(),
  notes: z.string().optional(),
});


export async function getClients(queryStr: string): Promise<Client[]> {
  const clientsRef = collection(db, 'clients');
  const q = queryStr 
    ? query(clientsRef, /* Adicionar lógicas de where() se necessário */)
    : query(clientsRef);

  const querySnapshot = await getDocs(q);
  let clients = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
  
  if (queryStr) {
      const lowercasedQuery = queryStr.toLowerCase();
      clients = clients.filter(client => 
        client.name.toLowerCase().includes(lowercasedQuery) || 
        client.cpf.includes(lowercasedQuery)
      );
  }

  return clients.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addClient(
  data: z.infer<typeof clientSchema>
): { success: boolean; message?: string } {
  const validation = clientSchema.safeParse(data);

  if (!validation.success) {
    console.error(validation.error.flatten());
    return { success: false, message: 'Dados inválidos.' };
  }

  try {
    const dataToSave = {
      ...validation.data,
      cpf: validation.data.cpf?.replace(/\D/g, ''),
      phone: validation.data.phone.replace(/\D/g, ''),
      createdAt: serverTimestamp(),
    };
    addDocumentNonBlocking(collection(db, 'clients'), dataToSave);
    return { success: true, message: 'Cliente adicionado com sucesso.' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Ocorreu um erro ao adicionar o cliente.' };
  }
}

export function updateClient(
  id: string,
  data: z.infer<typeof clientSchema>
): { success: boolean; message?: string } {
  const validation = clientSchema.safeParse(data);
  if (!validation.success) {
    console.error(validation.error.flatten());
    return { success: false, message: 'Dados inválidos.' };
  }

  try {
    const docRef = doc(db, 'clients', id);
    const dataToSave = {
      ...validation.data,
      cpf: validation.data.cpf?.replace(/\D/g, ''),
      phone: validation.data.phone.replace(/\D/g, ''),
    };
    updateDocumentNonBlocking(docRef, dataToSave);
    return { success: true, message: 'Cliente atualizado com sucesso.' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Ocorreu um erro ao atualizar o cliente.' };
  }
}

export function deleteClient(id: string): { success: boolean, message?: string } {
  try {
    const docRef = doc(db, 'clients', id);
    deleteDocumentNonBlocking(docRef);
    return { success: true, message: 'Cliente excluído com sucesso.' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Ocorreu um erro ao excluir o cliente.' };
  }
}
