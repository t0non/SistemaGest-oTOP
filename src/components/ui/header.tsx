'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserNav } from '@/components/layout/user-nav';
import { Menu, Package2, Users, Wrench, PiggyBank, LayoutDashboard } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from './button';


export function Header() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/dashboard/clients', icon: Users },
    { name: 'Ordens de Serviço', href: '/dashboard/service-orders', icon: Wrench },
    { name: 'Estoque', href: '/dashboard/products', icon: Package2 },
    { name: 'Financeiro', href: '/dashboard/finance', icon: PiggyBank },
  ];

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
      
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="https://files.catbox.moe/rsv9g4.png" alt="TechStore BH Logo" width={150} height={40} className="object-contain hidden sm:block" />
           <Package2 className="h-6 w-6 sm:hidden" />
           <span className="sr-only">TechStore Manager</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {links.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/dashboard');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-primary ${
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold mb-4"
              >
                <Package2 className="h-6 w-6" />
                <span className="sr-only">TechStore</span>
              </Link>
              {links.map((link) => {
                 const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/dashboard');
                 return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-4 px-2.5 ${isActive ? 'text-foreground' : 'text-muted-foreground'} hover:text-foreground`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.name}
                  </Link>
                 )
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <UserNav />
      </div>
    </header>
  );
}
