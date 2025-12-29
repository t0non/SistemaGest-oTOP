'use client';

import { useState, useEffect } from 'react';
import { User as UserIcon, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';

export function UserNav() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <Skeleton className="h-10 w-10 rounded-full" />;
  }

  return (
    <Avatar className="h-10 w-10">
        <AvatarImage src="https://i.pravatar.cc/150?u=admin" alt="admin" />
        <AvatarFallback>
            <UserIcon />
        </AvatarFallback>
    </Avatar>
  );
}
