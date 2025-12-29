import {ClientList} from '@/components/clients/client-list';
import {getClients} from './actions';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default async function ClientsPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const clients = await getClients(query);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Gestão de Clientes</h1>
        <p className="text-muted-foreground">
          Adicione, edite e gerencie os clientes da sua loja.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ClientList initialClients={clients} />
      </Suspense>
    </div>
  );
}
