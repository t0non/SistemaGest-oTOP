
"use client";

import {usePathname} from 'next/navigation';
import Link from 'next/link';
import {LayoutDashboard, Users, PiggyBank, Wrench} from 'lucide-react';

import {SidebarMenu, SidebarMenuItem, SidebarMenuButton} from '@/components/ui/sidebar';

const navItems = [
  {href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard},
  {href: '/dashboard/clients', label: 'Clientes', icon: Users},
  {href: '/dashboard/service-orders', label: 'Ordens de Serviço', icon: Wrench},
  {href: '/dashboard/finance', label: 'Financeiro', icon: PiggyBank},
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="p-2">
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={{children: item.label}}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
