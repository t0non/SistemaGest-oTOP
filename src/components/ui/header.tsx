'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserNav } from './user-nav';

export function Header() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Clientes', href: '/dashboard/clients' },
    { name: 'Ordens de Serviço', href: '/dashboard/service-orders' },
    { name: 'Financeiro', href: '/dashboard/finance' },
  ];

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
      
      {/* 1. Lado Esquerdo: Logo e Navegação */}
      <div className="flex items-center gap-8">
        <Link href="/dashboard">
            <h1 className="text-xl font-bold text-blue-600 tracking-tighter">
            Tech<span className="text-black">Store BH</span>
            </h1>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {links.map((link) => {
            const isActive = pathname.startsWith(link.href) && (link.href.length > 10 || pathname === link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-blue-600 ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. Lado Direito: Perfil / Avatar */}
      <UserNav />
    </header>
  );
}
