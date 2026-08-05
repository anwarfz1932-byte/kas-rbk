'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  User,
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface AdminUser {
  uid: string;
  email: string | null;
  name: string;
  role: 'admin';
  isDemo?: boolean;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
  loginAsDemoAdmin: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  changePassword: async () => {},
  loginAsDemoAdmin: () => {},
  logout: async () => {},
});

const DEFAULT_ADMIN: AdminUser = {
  uid: 'admin-kas-remaja',
  email: 'admin@kasremaja.org',
  name: 'Admin Karang Taruna',
  role: 'admin',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    if (typeof window !== 'undefined') {
      const savedDemo = localStorage.getItem('kas_remaja_demo_admin');
      if (savedDemo) {
        try {
          return JSON.parse(savedDemo);
        } catch (e) {
          localStorage.removeItem('kas_remaja_demo_admin');
        }
      }
    }
    return DEFAULT_ADMIN;
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);

          let adminData: AdminUser;
          if (snap.exists()) {
            const data = snap.data();
            adminData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: data.name || firebaseUser.email?.split('@')[0] || 'Admin Kas',
              role: 'admin',
            };
          } else {
            adminData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.email?.split('@')[0] || 'Admin Kas',
              role: 'admin',
            };
            await setDoc(userDocRef, {
              email: firebaseUser.email,
              name: adminData.name,
              role: 'admin',
              createdAt: new Date().toISOString(),
            });
          }
          setUser(adminData);
        } catch (err) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.email?.split('@')[0] || 'Admin Kas',
            role: 'admin',
          });
        }
      } else {
        if (typeof window !== 'undefined' && !localStorage.getItem('kas_remaja_demo_admin')) {
          setUser(DEFAULT_ADMIN);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    localStorage.removeItem('kas_remaja_demo_admin');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const register = async (email: string, pass: string, name: string) => {
    localStorage.removeItem('kas_remaja_demo_admin');
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      try {
        await setDoc(doc(db, 'users', res.user.uid), {
          email,
          name: name || 'Admin Kas',
          role: 'admin',
          createdAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Could not save user profile doc:', e);
      }
    }
  };

  const changePassword = async (newPass: string) => {
    if (auth.currentUser) {
      await updatePassword(auth.currentUser, newPass);
    } else if (user?.isDemo) {
      // Demo admin password change notification
      return;
    } else {
      throw new Error('Pengguna belum terautentikasi');
    }
  };

  const loginAsDemoAdmin = () => {
    const demoAdmin: AdminUser = {
      uid: 'demo-admin-123',
      email: 'admin.kas@remaja.org',
      name: 'Pengurus Kas Remaja (Demo Admin)',
      role: 'admin',
      isDemo: true,
    };
    localStorage.setItem('kas_remaja_demo_admin', JSON.stringify(demoAdmin));
    setUser(demoAdmin);
    setLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem('kas_remaja_demo_admin');
    setUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      // Ignored
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, changePassword, loginAsDemoAdmin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
