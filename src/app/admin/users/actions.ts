'use server';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/clientApp';
import { revalidatePath } from 'next/cache';
import type { UserProfile } from '@/lib/types';

export async function updateUserRoleAction(userId: string, newRole: UserProfile['role']) {
    // In a real app, we should verify that the CALLER is a super_admin.
    // For now, we rely on the page-level protection.
    if (!userId || !newRole) {
        return { success: false, error: 'User ID and new role are required.' };
    }
    if (!['volunteer', 'event_admin', 'super_admin'].includes(newRole)) {
        return { success: false, error: 'Invalid role specified.' };
    }

    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { role: newRole });
        
        revalidatePath('/admin/users');

        return { success: true, message: `User role updated to ${newRole}.` };

    } catch (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: 'Failed to update user role.' };
    }
}
