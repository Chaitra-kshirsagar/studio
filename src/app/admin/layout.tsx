'use client';

import { useAuth } from '@/context/AuthContext';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Home, List, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between p-2">
            <h2 className="text-lg font-semibold font-headline">Admin Panel</h2>
            <SidebarTrigger className="md:hidden" />
          </div>
        </SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/admin'}>
              <Link href="/admin"><Home />Dashboard</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/events')}>
              <Link href="/admin/events"><List />Events</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {user.role === 'super_admin' && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/users')}>
                <Link href="/admin/users"><Users />Users</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6 lg:p-8">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={['event_admin', 'super_admin']}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </RoleProtectedRoute>
  );
}
