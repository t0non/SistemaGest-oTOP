'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ClientList } from '@/components/clients/client-list';
import { getClients } from './actions';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function ClientsPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const [clients, setClients] = React.useState(() => getClients(query));

  // Listen for storage changes to update UI
  React.useEffect(() => {
    const handleStorageChange = () => {
      setClients(getClients(query));
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-changed', handleStorageChange); // Custom event
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-changed', handleStorageChange);
    };
  }, [query]);

  // Update when query changes
  React.useEffect(() => {
    setClients(getClients(query));
  }, [query]);

  return <ClientList initialClients={clients} />;
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
