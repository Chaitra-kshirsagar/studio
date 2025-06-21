'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleAuthProvider } from '@/firebase/clientApp';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
    user: UserProfile | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const handleUser = async (rawUser: FirebaseUser | null) => {
        if (rawUser) {
            setFirebaseUser(rawUser);
            const userRef = doc(db, 'users', rawUser.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                setUser(userSnap.data() as UserProfile);
            } else {
                // New user, create a document
                const newUserProfile: Omit<UserProfile, 'skills' | 'interests' | 'volunteerHours' | 'pastEvents'> = {
                    uid: rawUser.uid,
                    email: rawUser.email || '',
                    name: rawUser.displayName || 'New User',
                    avatarUrl: rawUser.photoURL || `https://placehold.co/100x100.png`,
                    role: 'volunteer', // default role
                };
                await setDoc(userRef, { ...newUserProfile, createdAt: serverTimestamp() });
                setUser(newUserProfile as UserProfile);
            }
        } else {
            setFirebaseUser(null);
            setUser(null);
        }
        setLoading(false);
    };

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleAuthProvider);
        } catch (error) {
            console.error("Error signing in with Google: ", error);
        }
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setFirebaseUser(null);
        router.push('/');
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, handleUser);
        return () => unsubscribe();
    }, []);

    const value = {
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
