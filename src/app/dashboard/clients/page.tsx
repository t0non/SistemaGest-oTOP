'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ClientList } from '@/components/clients/client-list';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Client } from '@/lib/definitions';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

function ClientsPageContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('query') || '';
  const firestore = useFirestore();
  const { isUserLoading } = useUser();

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'clients'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: allClients, isLoading: clientsLoading } = useCollection<Client>(clientsQuery);

  const filteredClients = React.useMemo(() => {
    if (!allClients) return [];
    if (!queryParam) return allClients;
    const lowercasedQuery = queryParam.toLowerCase();
    return allClients.filter(
      (client) =>
        client.name.toLowerCase().includes(lowercasedQuery) ||
        (client.cpf && client.cpf.includes(lowercasedQuery))
    );
  }, [allClients, queryParam]);

  const isLoading = isUserLoading || clientsLoading;

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return <ClientList clients={filteredClients} />;
}


export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Gestão de Clientes</h1>
        <p className="text-muted-foreground">
          Adicione, edite e gerencie os clientes da sua loja.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ClientsPageContent />
      </Suspense>
    </div>
  );
}
