'use client';

import { z } from 'zod';
import type { ServiceOrder, ServiceOrderItem } from '@/lib/definitions';
import { ServiceOrderStatus } from '@/lib/definitions';

const serviceOrderItemSchema = z.object({
  id: z.string(),
  description: z.string().min(3, 'A descrição do item é necessária.'),
  quantity: z.number().min(1, 'A quantidade deve ser pelo menos 1.'),
  unitPrice: z.number().min(0, 'O preço deve ser positivo.'),
});

const serviceOrderSchema = z.object({
  clientId: z.string().min(1, 'O cliente é obrigatório.'),
  clientName: z.string(),
  equipment: z.string().min(3, { message: 'O nome do equipamento é obrigatório.' }),
  problemDescription: z.string().optional(),
  status: z.enum(ServiceOrderStatus),
  notes: z.string().optional(),
  entryDate: z.string(), // Garante que a data está presente
  items: z.array(serviceOrderItemSchema).min(1, 'Adicione pelo menos um item de serviço.'),
});

type ActionResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

const getServiceOrdersFromStorage = (): ServiceOrder[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('serviceOrders');
  // Simple migration for old orders without items
  try {
    const orders: ServiceOrder[] = stored ? JSON.parse(stored) : [];
    return orders.map(order => {
        if (!order.items && order.finalValue) {
            return {
                ...order,
                items: [{
                    id: 'default-item',
                    description: `${order.equipment} - ${order.problemDescription || 'Serviço Geral'}`,
                    quantity: 1,
                    unitPrice: order.finalValue
                }]
            }
        }
        return order;
    });
  } catch(e) {
      return [];
  }
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

const calculateFinalValue = (items: ServiceOrderItem[] = []) => {
    return items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
}

export function addServiceOrder(
  data: Omit<z.infer<typeof serviceOrderSchema>, 'finalValue'>
): ActionResponse {
  const validation = serviceOrderSchema.safeParse(data);

  if (!validation.success) {
    console.error(validation.error.flatten());
    return { success: false, message: 'Dados inválidos.' };
  }
  
  let serviceOrders = getServiceOrdersFromStorage();

  const existingIds = serviceOrders.map(o => parseInt(o.id.split('-')[1] || '0', 10));
  const newIdNumber = (existingIds.length > 0 ? Math.max(...existingIds) : 0) + 1;
  
  const finalValue = calculateFinalValue(validation.data.items);

  const newServiceOrder: ServiceOrder = {
    id: `OS-${newIdNumber}`,
    ...validation.data,
    finalValue,
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
  
  const combinedData = { 
      ...existingData, 
      ...data,
    };
  
  const validation = serviceOrderSchema.safeParse(combinedData);
  if (!validation.success) {
    console.error(validation.error.flatten());
    return { success: false, message: 'Dados de atualização inválidos.' };
  }

  const finalValue = calculateFinalValue(validation.data.items);

  const updatedOrder: ServiceOrder = {
      ...existingData,
      ...validation.data,
      finalValue
  }

  serviceOrders[osIndex] = updatedOrder;
  saveServiceOrdersToStorage(serviceOrders);
  return { success: true, message: 'Ordem de Serviço atualizada com sucesso.', data: updatedOrder };
}
