import {getIronSession} from 'iron-session';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {Bot, ChevronDown, LayoutDashboard, Users, PiggyBank, LogOut, User as UserIcon} from 'lucide-react';
import Link from 'next/link';

import {SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, SidebarInset} from '@/components/ui/sidebar';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {signOut} from '@/lib/auth-actions';
import {SessionData, sessionOptions} from '@/lib/auth';
import {SidebarNav} from '@/components/layout/sidebar-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

async function getUser() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  if (!session.isLoggedIn) {
    redirect('/login');
  }
  return session;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <SidebarProvider>
      <Sidebar
        className="border-r border-sidebar-border"
        collapsible="icon"
        variant="sidebar"
      >
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
             <div className="bg-sidebar-primary text-sidebar-primary-foreground rounded-full p-2">
                <Bot size={24} />
              </div>
            <span className="font-headline text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              TechStore BH
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h2 className="text-lg font-semibold font-headline">Dashboard</h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className='h-8 w-8'>
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} alt={user.email} />
                    <AvatarFallback>
                        <UserIcon/>
                    </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">{user.email}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <form action={signOut}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
