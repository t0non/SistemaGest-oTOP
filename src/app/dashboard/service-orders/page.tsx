'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getServiceOrders } from './actions';
import { ServiceOrderList } from '@/components/service-orders/service-order-list';
import { getClients } from '../clients/actions';
import { useEffect, useState } from 'react';
import type { Client, ServiceOrder } from '@/lib/definitions';
import { useSearchParams } from 'next/navigation';

function ServiceOrdersContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [soData, clientData] = await Promise.all([
        getServiceOrders(query),
        getClients(''),
      ]);
      setServiceOrders(soData);
      setClients(clientData);
      setLoading(false);
    }
    fetchData();
  }, [query]);

  return (
    <>
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <ServiceOrderList initialServiceOrders={serviceOrders} clients={clients} />
      )}
    </>
  );
}

export default function ServiceOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Ordens de Serviço</h1>
        <p className="text-muted-foreground">
          Gerencie as ordens de serviço da sua assistência técnica.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ServiceOrdersContent />
      </Suspense>
    </div>
  );
}
