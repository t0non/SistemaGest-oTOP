'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ServiceOrderList } from '@/components/service-orders/service-order-list';
import type { Client, ServiceOrder } from '@/lib/definitions';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

function ServiceOrdersContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('query') || '';
  const firestore = useFirestore();
  const { isUserLoading } = useUser();

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  // Fetch clients once
  useEffect(() => {
    if (!firestore) return;
    const fetchClients = async () => {
      setClientsLoading(true);
      const clientsRef = collection(firestore, 'clients');
      const clientSnapshot = await getDocs(clientsRef);
      const clientsData = clientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(clientsData);
      setClientsLoading(false);
    };
    fetchClients();
  }, [firestore]);


  const serviceOrdersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'serviceOrders'), orderBy('entryDate', 'desc'));
  }, [firestore]);

  const { data: allServiceOrders, isLoading: soLoading } = useCollection<ServiceOrder>(serviceOrdersQuery);

  const filteredServiceOrders = useMemo(() => {
    if (!allServiceOrders) return [];
    if (!queryParam) return allServiceOrders;

    const lowercasedQuery = queryParam.toLowerCase();
    return allServiceOrders.filter(
      (os) =>
        os.clientName.toLowerCase().includes(lowercasedQuery) ||
        os.equipment.toLowerCase().includes(lowercasedQuery) ||
        (os.id && os.id.toLowerCase().includes(lowercasedQuery))
    );
  }, [allServiceOrders, queryParam]);


  const isLoading = soLoading || isUserLoading || clientsLoading;

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return <ServiceOrderList initialServiceOrders={filteredServiceOrders} clients={clients} />;
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
