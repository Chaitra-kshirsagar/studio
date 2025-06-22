'use server';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { storage, db } from '@/firebase/clientApp';

export async function uploadCertificateAction(formData: FormData) {
    const file = formData.get('certificate') as File;
    const eventId = formData.get('eventId') as string;
    const userId = formData.get('userId') as string;
    const eventName = formData.get('eventName') as string;

    if (!file || !eventId || !userId || !eventName) {
        return { success: false, error: 'Missing required data.' };
    }

    try {
        // 1. Upload file to Firebase Storage
        const filePath = `certificates/${eventId}/${userId}/${file.name}`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, file);
        
        // 2. Get download URL
        const fileUrl = await getDownloadURL(storageRef);

        // 3. Save metadata to Firestore
        await addDoc(collection(db, 'certificates'), {
            userId,
            eventId,
            eventName,
            fileUrl,
            dateIssued: serverTimestamp(),
        });

        // 4. Revalidate paths
        revalidatePath(`/admin/events/${eventId}/attendees`);
        revalidatePath(`/profile`); // The user's profile will be updated

        return { success: true, message: 'Certificate uploaded successfully!' };

    } catch (error) {
        console.error("Error uploading certificate:", error);
        return { success: false, error: 'An unexpected error occurred during upload.' };
    }
}
