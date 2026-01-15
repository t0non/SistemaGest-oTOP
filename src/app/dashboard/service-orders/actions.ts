'use client';

import { z } from 'zod';
import type { ServiceOrder, ServiceOrderItem } from '@/lib/definitions';
import { ServiceOrderStatus } from '@/lib/definitions';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  entryDate: z.string(),
  items: z.array(serviceOrderItemSchema).min(1, 'Adicione pelo menos um item de serviço.'),
});

type ActionResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

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
  
  try {
    const finalValue = calculateFinalValue(validation.data.items);

    const newServiceOrder: Omit<ServiceOrder, 'id'> = {
      ...validation.data,
      finalValue,
      createdAt: serverTimestamp(),
    } as unknown as Omit<ServiceOrder, 'id'>;

    addDocumentNonBlocking(collection(db, 'serviceOrders'), newServiceOrder);

    return { success: true, message: 'Ordem de Serviço adicionada com sucesso.' };
  } catch(e:any) {
    return { success: false, message: e.message || "Erro ao criar OS." }
  }
}

export function updateServiceOrder(
  id: string,
  data: Partial<z.infer<typeof serviceOrderSchema>>
): ActionResponse {
  
  const validation = serviceOrderSchema.partial().safeParse(data);
  if (!validation.success) {
    console.error(validation.error.flatten());
    return { success: false, message: 'Dados de atualização inválidos.' };
  }

  try {
    const osRef = doc(db, 'serviceOrders', id);
    let dataToUpdate = { ...validation.data };

    if(data.items) {
        (dataToUpdate as any).finalValue = calculateFinalValue(data.items);
    }
    
    updateDocumentNonBlocking(osRef, dataToUpdate);

    return { success: true, message: 'Ordem de Serviço atualizada com sucesso.' };
  } catch(e: any) {
    return { success: false, message: e.message || 'Ocorreu um erro ao atualizar a OS.' };
  }
}
