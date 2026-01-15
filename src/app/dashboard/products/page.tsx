'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/lib/definitions';
import { ProductList } from '@/components/products/product-list';
import { useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('query') || '';
  const firestore = useFirestore();
  const { isUserLoading } = useUser();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: allProducts, isLoading: productsLoading } = useCollection<Product>(productsQuery);

  const filteredProducts = React.useMemo(() => {
    if (!allProducts) return [];
    if (!queryParam) return allProducts;

    const lowercasedQuery = queryParam.toLowerCase();
    return allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercasedQuery) ||
        product.supplierName?.toLowerCase().includes(lowercasedQuery)
    );
  }, [allProducts, queryParam]);

  const isLoading = productsLoading || isUserLoading;

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return <ProductList initialProducts={filteredProducts} />;
}


export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">Gestão de Estoque</h1>
        <p className="text-muted-foreground">
          Adicione, edite e gerencie as peças e produtos da sua loja.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ProductsPageContent />
      </Suspense>
    </div>
  );
}
