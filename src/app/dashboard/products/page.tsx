
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts } from './actions';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/lib/definitions';
import { ProductList } from '@/components/products/product-list';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchProducts = React.useCallback(() => {
    setLoading(true);
    const productData = getProducts(query);
    setProducts(productData);
    setLoading(false);
  }, [query]);


  // Listen for storage changes to update UI
  React.useEffect(() => {
    fetchProducts();
    
    const handleStorageChange = () => {
      fetchProducts();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-changed', handleStorageChange); // Custom event
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-changed', handleStorageChange);
    };
  }, [query, fetchProducts]);
  
  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return <ProductList initialProducts={products} />;
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
