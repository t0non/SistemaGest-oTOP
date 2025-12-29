'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { getServiceOrders } from './actions';
import { ServiceOrderList } from '@/components/service-orders/service-order-list';
import { getClients } from '../clients/actions';
import type { Client, ServiceOrder } from '@/lib/definitions';

function ServiceOrdersContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = (query: string) => {
      setLoading(true);
      const soData = getServiceOrders(query);
      const clientData = getClients('');
      setServiceOrders(soData);
      setClients(clientData);
      setLoading(false);
  }

  useEffect(() => {
    fetchData(query);

    const handleStorageChange = () => fetchData(query);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-changed', handleStorageChange); // Custom event

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('local-storage-changed', handleStorageChange);
    };
  }, [query]);

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return <ServiceOrderList initialServiceOrders={serviceOrders} clients={clients} />;
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
