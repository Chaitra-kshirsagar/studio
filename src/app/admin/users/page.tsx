'use client';

import { useState, useEffect, useTransition } from 'react';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import { db } from '@/firebase/clientApp';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { updateUserRoleAction } from './actions';
import { useToast } from '@/hooks/use-toast';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

function UserManagementContent() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            try {
                const usersCollection = collection(db, 'users');
                const q = query(usersCollection, orderBy('name'));
                const querySnapshot = await getDocs(q);
                const fetchedUsers = querySnapshot.docs.map(doc => doc.data() as UserProfile);
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch user data.' });
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [toast]);

    const handleRoleChange = (userId: string, newRole: UserProfile['role']) => {
        startTransition(async () => {
            const result = await updateUserRoleAction(userId, newRole);
            if(result.success) {
                toast({ title: 'Success', description: result.message });
                // Optimistically update UI
                setUsers(prevUsers => prevUsers.map(u => u.uid === userId ? {...u, role: newRole} : u));
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        });
    };

    const getRoleBadgeVariant = (role: UserProfile['role']) => {
        switch (role) {
            case 'super_admin': return 'destructive';
            case 'event_admin': return 'default';
            default: return 'secondary';
        }
    }

    const RoleSelector = ({ user }: { user: UserProfile }) => (
        <Select 
            defaultValue={user.role} 
            onValueChange={(value) => handleRoleChange(user.uid, value as UserProfile['role'])}
            disabled={isPending}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select new role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="volunteer">Volunteer</SelectItem>
                <SelectItem value="event_admin">Event Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
            </SelectContent>
        </Select>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-headline">User Management</CardTitle>
                <CardDescription>Assign roles and manage user permissions.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="border rounded-lg hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="text-center">Current Role</TableHead>
                                        <TableHead className="text-right">Change Role</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map(user => (
                                        <TableRow key={user.uid}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{user.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={getRoleBadgeVariant(user.role)}>{user.role.replace('_', ' ')}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <RoleSelector user={user} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                         {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                            {users.map(user => (
                                <Card key={user.uid}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-base">{user.name}</CardTitle>
                                                    <CardDescription>{user.email}</CardDescription>
                                                </div>
                                            </div>
                                             <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">{user.role.replace('_', ' ')}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col space-y-2">
                                            <Label>Change Role</Label>
                                            <RoleSelector user={user} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default function UserManagementPage() {
    // This page is nested under /admin/layout.tsx which already checks for admin roles.
    // We add another layer here to ensure ONLY super_admin can see it.
    return (
        <RoleProtectedRoute allowedRoles={['super_admin']}>
            <UserManagementContent />
        </RoleProtectedRoute>
    )
}
