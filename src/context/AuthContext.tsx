'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
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

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (rawUser) => {
            if (rawUser) {
                setFirebaseUser(rawUser);
                const userRef = doc(db, 'users', rawUser.uid);
                
                const unsubscribeSnapshot = onSnapshot(userRef, async (userSnap) => {
                    if (userSnap.exists()) {
                        setUser(userSnap.data() as UserProfile);
                    } else {
                        // New user, create a document
                        const newUserProfile: UserProfile = {
                            uid: rawUser.uid,
                            email: rawUser.email || '',
                            name: rawUser.displayName || 'New User',
                            avatarUrl: rawUser.photoURL || `https://placehold.co/100x100.png`,
                            role: 'volunteer', // default role
                            registeredEventIds: [],
                            skills: [],
                            interests: [],
                            pastEvents: [],
                            volunteerHours: 0,
                            createdAt: serverTimestamp()
                        };
                        await setDoc(userRef, newUserProfile);
                        setUser(newUserProfile);
                    }
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                setFirebaseUser(null);
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);


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
