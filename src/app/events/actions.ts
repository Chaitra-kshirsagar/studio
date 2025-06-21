'use server';

import { doc, runTransaction, serverTimestamp, collection, writeBatch } from 'firebase/firestore';
import { db } from '@/firebase/clientApp';
import type { Event } from '@/lib/types';
import { revalidatePath } from 'next/cache';

type RegisterEventParams = {
    eventId: string;
    userId: string;
    userName: string;
    customFields: {
        tShirtSize: string;
    };
};

export async function registerForEventAction(data: RegisterEventParams) {
    const { eventId, userId, userName, customFields } = data;

    try {
        await runTransaction(db, async (transaction) => {
            const eventRef = doc(db, 'events', eventId);
            const userRef = doc(db, 'users', userId);
            const registrationRef = doc(collection(db, 'registrations'));

            // 1. Check if user is already registered
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User profile not found.");
            }
            const userData = userDoc.data();
            if (userData.registeredEventIds?.includes(eventId)) {
                throw new Error("You are already registered for this event.");
            }

            // 2. Get current event details
            const eventDoc = await transaction.get(eventRef);
            if (!eventDoc.exists()) {
                throw new Error("Event not found.");
            }
            const eventData = eventDoc.data() as Event;

            // 3. Determine registration status (registered vs. waitlisted)
            const isFull = eventData.participants >= eventData.maxParticipants;
            const status = isFull ? 'waitlisted' : 'registered';

            // 4. Create new registration document
            transaction.set(registrationRef, {
                userId,
                eventId,
                status,
                createdAt: serverTimestamp(),
                userName,
                customFields,
            });

            // 5. Update user's registered events list
            const newRegisteredEventIds = [...(userData.registeredEventIds || []), eventId];
            transaction.update(userRef, { registeredEventIds: newRegisteredEventIds });

            // 6. If not full, increment participant count on the event
            if (!isFull) {
                transaction.update(eventRef, { participants: eventData.participants + 1 });
            }
        });

        // Revalidate paths to show updated participant counts
        revalidatePath('/');
        revalidatePath(`/events/${eventId}`);
        revalidatePath('/profile');

        return { success: true, message: 'Successfully registered for the event.' };
    } catch (error: any) {
        console.error("Error registering for event:", error);
        return { success: false, error: error.message || 'An unexpected error occurred.' };
    }
}
