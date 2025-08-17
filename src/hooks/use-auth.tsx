
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    onAuthStateChanged, 
    User, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { auth, db } from '@/lib/firebase';
import { Languages } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string, displayName: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
  sendPasswordReset: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Handle redirect result
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          // This is the signed-in user
          const user = result.user;
          // Check if it's a new user and create settings doc if so
          const settingsRef = doc(db, "userSettings", user.uid);
          const docSnap = await getDoc(settingsRef);

          if (!docSnap.exists()) {
            await setDoc(settingsRef, {
              nativeLanguage: "en",
              defaultTargetLanguage: "es",
              defaultTone: "formal",
              saveHistory: true,
            });
          }
        }
      }).catch((error) => {
        // Handle Errors here.
        console.error("Error getting redirect result:", error);
      }).finally(() => {
        setLoading(false);
      });


    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create initial user settings and update profile in parallel
    const settingsRef = doc(db, "userSettings", userCredential.user.uid);
    await Promise.all([
      updateProfile(userCredential.user, { displayName }),
      setDoc(settingsRef, {
        nativeLanguage: "en",
        defaultTargetLanguage: "es",
        defaultTone: "formal",
        saveHistory: true,
      })
    ]);

    return userCredential;
  };
  
  const signIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Use signInWithRedirect instead of signInWithPopup
    await signInWithRedirect(auth, provider);
  };
  
  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const sendPasswordReset = (email: string) => {
      return sendPasswordResetEmail(auth, email);
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    sendPasswordReset
  };
  
  if (loading) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <Languages className="h-10 w-10 animate-pulse text-primary" />
       </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
