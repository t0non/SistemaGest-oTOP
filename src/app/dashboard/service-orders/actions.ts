'use client';

import { z } from 'zod';
import type { ServiceOrder, ServiceOrderItem } from '@/lib/definitions';
import { ServiceOrderStatus } from '@/lib/definitions';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
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
  entryDate: z.union([z.string(), z.instanceof(Timestamp)]),
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
    
    let entryDate: Timestamp;
    if (typeof validation.data.entryDate === 'string') {
        entryDate = Timestamp.fromDate(new Date(validation.data.entryDate + 'T12:00:00Z'));
    } else {
        entryDate = validation.data.entryDate;
    }


    const newServiceOrder: Omit<ServiceOrder, 'id'> = {
      ...validation.data,
      entryDate,
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
  data: Partial<Omit<z.infer<typeof serviceOrderSchema>, 'entryDate'> & { entryDate?: string | Date | Timestamp }>
): ActionResponse {
  
  // Use a more flexible schema for partial updates
  const partialSchema = serviceOrderSchema.partial();
  const validation = partialSchema.safeParse(data);

  if (!validation.success) {
    console.error(validation.error.flatten());
    return { success: false, message: 'Dados de atualização inválidos.' };
  }

  try {
    const osRef = doc(db, 'serviceOrders', id);
    let dataToUpdate = { ...validation.data } as any;

    if (data.items) {
        dataToUpdate.finalValue = calculateFinalValue(data.items);
    }

    if (data.entryDate && typeof data.entryDate === 'string') {
        dataToUpdate.entryDate = Timestamp.fromDate(new Date(data.entryDate + 'T12:00:00Z'));
    } else if (data.entryDate instanceof Date) {
        dataToUpdate.entryDate = Timestamp.fromDate(data.entryDate);
    }
    
    updateDocumentNonBlocking(osRef, dataToUpdate);

    return { success: true, message: 'Ordem de Serviço atualizada com sucesso.' };
  } catch(e: any) {
    return { success: false, message: e.message || 'Ocorreu um erro ao atualizar a OS.' };
  }
}
