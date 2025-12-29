
'use server';

import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {mockServiceOrders} from '@/lib/mock-data';
import type {ServiceOrder} from '@/lib/definitions';
import { ServiceOrderStatus } from '@/lib/definitions';

// Mock database
let serviceOrders: ServiceOrder[] = [...mockServiceOrders];

const serviceOrderSchema = z.object({
  clientId: z.string(),
  clientName: z.string(),
  equipment: z.string().min(3, {message: 'O nome do equipamento é obrigatório.'}),
  problemDescription: z.string().optional(),
  status: z.enum(ServiceOrderStatus),
  finalValue: z.number().optional(),
  notes: z.string().optional(),
});


type ActionResponse = {
  success: boolean;
  message?: string;
};

// Simulate network delay
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getServiceOrders(query: string): Promise<ServiceOrder[]> {
  await delay(500);

  if (!query) {
    return serviceOrders.sort((a,b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
  }

  const lowercasedQuery = query.toLowerCase();
  return serviceOrders.filter(
    (os) =>
      os.clientName.toLowerCase().includes(lowercasedQuery) ||
      os.equipment.toLowerCase().includes(lowercasedQuery) ||
      os.id.toLowerCase().includes(lowercasedQuery)
  ).sort((a,b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
}

export async function addServiceOrder(
  data: z.infer<typeof serviceOrderSchema>
): Promise<ActionResponse> {
  await delay(1000);
  const validation = serviceOrderSchema.safeParse(data);

  if (!validation.success) {
    return {success: false, message: 'Dados inválidos.'};
  }

  const newIdNumber = Math.max(...serviceOrders.map(o => parseInt(o.id.split('-')[1], 10))) + 1;

  const newServiceOrder: ServiceOrder = {
    id: `OS-${newIdNumber}`,
    ...validation.data,
    entryDate: new Date().toISOString(),
  };

  serviceOrders.unshift(newServiceOrder);
  revalidatePath('/dashboard/service-orders');
  return {success: true, message: 'Ordem de Serviço adicionada com sucesso.'};
}

export async function updateServiceOrder(
  id: string,
  data: Partial<z.infer<typeof serviceOrderSchema>>
): Promise<ActionResponse> {
  await delay(1000);

  const osIndex = serviceOrders.findIndex((o) => o.id === id);
  if (osIndex === -1) {
    return {success: false, message: 'Ordem de Serviço não encontrada.'};
  }

  const existingData = serviceOrders[osIndex];
  const combinedData = { ...existingData, ...data, entryDate: existingData.entryDate };
  
  const validation = serviceOrderSchema.safeParse(combinedData);
  if (!validation.success) {
    console.log(validation.error.flatten());
    return {success: false, message: 'Dados de atualização inválidos.'};
  }

  serviceOrders[osIndex] = validation.data;
  revalidatePath('/dashboard/service-orders');
  return {success: true, message: 'Ordem de Serviço atualizada com sucesso.'};
}
