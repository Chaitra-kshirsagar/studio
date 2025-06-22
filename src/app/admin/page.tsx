'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { List, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/clientApp';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ eventCount: 0, userCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            if (!user) return;
            try {
                setLoading(true);
                const eventsPromise = getDocs(collection(db, 'events'));
                const usersPromise = getDocs(collection(db, 'users'));
                const [eventSnapshot, userSnapshot] = await Promise.all([eventsPromise, usersPromise]);
                setStats({
                    eventCount: eventSnapshot.size,
                    userCount: userSnapshot.size,
                });
            } catch (error) {
                console.error("Failed to fetch admin stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [user]);

    if (!user) {
        return null;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Admin Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user.name}. Here's an overview of Bhumi Connect.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Events</CardTitle>
                        <CardDescription>The total number of events created on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-16" /> : (
                            <div className="text-4xl font-bold">{stats.eventCount}</div>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Total Users</CardTitle>
                        <CardDescription>The total number of registered users and volunteers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-16" /> : (
                            <div className="text-4xl font-bold">{stats.userCount}</div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><List /> Event Management</CardTitle>
                        <CardDescription>Create new events, manage attendees, and view existing events.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-end">
                        <Button asChild>
                            <Link href="/admin/events">Go to Events <ArrowRight className="ml-2" /></Link>
                        </Button>
                    </CardContent>
                </Card>
                {user.role === 'super_admin' && (
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users /> User Management</CardTitle>
                            <CardDescription>View all users and manage their roles and permissions.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex items-end">
                           <Button asChild>
                               <Link href="/admin/users">Manage Users <ArrowRight className="ml-2" /></Link>
                           </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
