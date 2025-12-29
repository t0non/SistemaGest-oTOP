
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getServiceOrders } from './actions';
import { ServiceOrderList } from '@/components/service-orders/service-order-list';
import { getClients } from '../clients/actions';

export default async function ServiceOrdersPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  // In a real app, these would be optimized to avoid fetching all clients
  const serviceOrders = await getServiceOrders(query);
  const clients = await getClients('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Ordens de Serviço</h1>
        <p className="text-muted-foreground">
          Gerencie as ordens de serviço da sua assistência técnica.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ServiceOrderList initialServiceOrders={serviceOrders} clients={clients} />
      </Suspense>
    </div>
  );
}
