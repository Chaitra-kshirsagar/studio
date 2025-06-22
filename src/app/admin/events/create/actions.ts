'use server';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/clientApp';
import { revalidatePath } from 'next/cache';
import type { Event } from '@/lib/types';

// The form will submit this data structure
// We omit fields that are generated or have defaults
export type CreateEventFormData = {
    name: string;
    description: string;
    location: string;
    date: Date;
    maxParticipants: number;
    visibility: 'public' | 'private';
    groupId?: string;
    imageUrl: string;
    createdBy: string;
    customReminderMessage?: string;
    postEventMessage?: string;
};

export async function createEventAction(data: CreateEventFormData) {
    try {
        const eventData: Omit<Event, 'id'> = {
            ...data,
            // Add default values for fields not in the form
            category: "Community", // Default category
            requiredSkills: [], // Default empty skills
            imageHint: "event photo", // Default hint
            participants: 0,
            createdAt: serverTimestamp(),
        }

        await addDoc(collection(db, 'events'), eventData);

        // Revalidate paths to show the new event
        revalidatePath('/admin/events');
        revalidatePath('/');

        return { success: true, message: 'Event created successfully.' };

    } catch (error) {
        console.error("Error creating event: ", error);
        return { success: false, error: 'An unexpected error occurred while creating the event.' };
    }
}
