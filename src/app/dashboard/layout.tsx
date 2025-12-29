import { Header } from '@/components/ui/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-900">
      
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6">
        {children}
      </main>
      
    </div>
  );
}
