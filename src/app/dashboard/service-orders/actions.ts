'use client';

import { z } from 'zod';
import type { ServiceOrder } from '@/lib/definitions';
import { ServiceOrderStatus } from '@/lib/definitions';

const serviceOrderSchema = z.object({
  clientId: z.string(),
  clientName: z.string(),
  equipment: z.string().min(3, { message: 'O nome do equipamento é obrigatório.' }),
  problemDescription: z.string().optional(),
  status: z.enum(ServiceOrderStatus),
  finalValue: z.number().optional(),
  notes: z.string().optional(),
});

type ActionResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

const getServiceOrdersFromStorage = (): ServiceOrder[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('serviceOrders');
  return stored ? JSON.parse(stored) : [];
};

const saveServiceOrdersToStorage = (orders: ServiceOrder[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('serviceOrders', JSON.stringify(orders));
  window.dispatchEvent(new Event('local-storage-changed'));
};


export function getServiceOrders(query: string): ServiceOrder[] {
  let serviceOrders = getServiceOrdersFromStorage();

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

export function addServiceOrder(
  data: z.infer<typeof serviceOrderSchema>
): ActionResponse {
  const validation = serviceOrderSchema.safeParse(data);

  if (!validation.success) {
    return { success: false, message: 'Dados inválidos.' };
  }
  
  let serviceOrders = getServiceOrdersFromStorage();

  // Find the highest existing ID number to avoid collisions
  const existingIds = serviceOrders.map(o => parseInt(o.id.split('-')[1] || '0', 10));
  const newIdNumber = (existingIds.length > 0 ? Math.max(...existingIds) : 0) + 1;

  const newServiceOrder: ServiceOrder = {
    id: `OS-${newIdNumber}`,
    ...validation.data,
    entryDate: new Date().toISOString(),
  };

  serviceOrders.unshift(newServiceOrder);
  saveServiceOrdersToStorage(serviceOrders);
  return { success: true, message: 'Ordem de Serviço adicionada com sucesso.', data: newServiceOrder };
}

export function updateServiceOrder(
  id: string,
  data: Partial<z.infer<typeof serviceOrderSchema>>
): ActionResponse {
  
  let serviceOrders = getServiceOrdersFromStorage();
  const osIndex = serviceOrders.findIndex((o) => o.id === id);
  if (osIndex === -1) {
    return { success: false, message: 'Ordem de Serviço não encontrada.' };
  }

  const existingData = serviceOrders[osIndex];
  
  // This combines the existing data with the partial update data.
  // entryDate is preserved. clientName could be updated if clientId changes, but we disable clientId change on edit form.
  const combinedData = { 
      ...existingData, 
      ...data, 
      entryDate: existingData.entryDate,
      clientName: data.clientName || existingData.clientName,
      clientId: data.clientId || existingData.clientId
    };
  
  // Re-validate the full object
  const validation = serviceOrderSchema.safeParse(combinedData);
  if (!validation.success) {
    console.error(validation.error.flatten());
    return { success: false, message: 'Dados de atualização inválidos.' };
  }

  const updatedOrder: ServiceOrder = {
      ...existingData,
      ...validation.data,
  }

  serviceOrders[osIndex] = updatedOrder;
  saveServiceOrdersToStorage(serviceOrders);
  return { success: true, message: 'Ordem de Serviço atualizada com sucesso.', data: updatedOrder };
}
