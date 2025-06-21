'use client';

import { useAuth } from '@/context/AuthContext';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserProfile['role'][];
}

const RoleProtectedRoute = ({ children, allowedRoles }: RoleProtectedRouteProps) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        if (!allowedRoles.includes(user.role)) {
            router.push('/');
        }

    }, [user, loading, router, allowedRoles]);

    if (loading || !user || !allowedRoles.includes(user.role)) {
        return (
             <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Checking permissions...</span>
            </div>
        );
    }

    return <>{children}</>;
};

export default RoleProtectedRoute;
