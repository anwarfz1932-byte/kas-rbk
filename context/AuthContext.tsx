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
  login: (username: string, pass: string) => Promise<void>;
  register: (username: string, pass: string, name: string) => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  changePassword: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    if (typeof window !== 'undefined') {
      const savedAdmin = localStorage.getItem('kas_remaja_admin_session');
      if (savedAdmin) {
        try {
          return JSON.parse(savedAdmin);
        } catch (e) {
          localStorage.removeItem('kas_remaja_admin_session');
        }
      }
    }
    return null;
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
              name: data.name || data.username || firebaseUser.email?.split('@')[0] || 'Admin Kas',
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
        if (typeof window !== 'undefined' && !localStorage.getItem('kas_remaja_admin_session')) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (usernameInput: string, pass: string) => {
    localStorage.removeItem('kas_remaja_admin_session');
    const cleanUsername = usernameInput.trim();
    const cleanLower = cleanUsername.toLowerCase();
    const inputPass = pass.trim();

    // Retrieve custom password if changed by admin, or default to "adminkt07"
    let savedPwd = 'adminkt07';
    if (typeof window !== 'undefined') {
      const storedPwd = localStorage.getItem('kas_remaja_admin_pwd');
      if (storedPwd) savedPwd = storedPwd;
    }

    // Accept specified credentials:
    // Username: "remaja blater kidul" or "admin" or similar
    // Password: "adminkt07" or custom saved password
    const isValidAdmin =
      (cleanLower === 'remaja blater kidul' || cleanLower === 'admin' || cleanLower.includes('remaja')) &&
      (inputPass === savedPwd || inputPass === 'adminkt07');

    if (isValidAdmin) {
      const adminUser: AdminUser = {
        uid: 'admin-remaja-blater-kidul',
        email: 'remajablaterkidul@kasremaja.org',
        name: cleanUsername === 'admin' ? 'Remaja Blater Kidul' : cleanUsername,
        role: 'admin',
      };
      localStorage.setItem('kas_remaja_admin_session', JSON.stringify(adminUser));
      setUser(adminUser);
      return;
    }

    // Try Firebase Auth as secondary fallback, catching operation-not-allowed
    const emailToUse = usernameInput.includes('@')
      ? usernameInput.trim()
      : `${cleanLower.replace(/\s+/g, '')}@kasremaja.org`;

    try {
      await signInWithEmailAndPassword(auth, emailToUse, pass);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        throw new Error('Username atau password salah');
      }
      throw err;
    }
  };

  const register = async (usernameInput: string, pass: string, name: string) => {
    localStorage.removeItem('kas_remaja_admin_session');
    const cleanUsername = usernameInput.trim();
    const cleanLower = cleanUsername.toLowerCase();
    const emailToUse = usernameInput.includes('@')
      ? usernameInput.trim()
      : `${cleanLower.replace(/\s+/g, '')}@kasremaja.org`;

    const res = await createUserWithEmailAndPassword(auth, emailToUse, pass);
    if (res.user) {
      try {
        await setDoc(doc(db, 'users', res.user.uid), {
          email: emailToUse,
          username: cleanUsername,
          name: name || cleanUsername,
          role: 'admin',
          createdAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn('Could not save user profile doc:', e);
      }
    }
  };

  const changePassword = async (newPass: string) => {
    localStorage.setItem('kas_remaja_admin_pwd', newPass);
    if (auth.currentUser) {
      try {
        await updatePassword(auth.currentUser, newPass);
      } catch (e) {
        // Fallback handled via localStorage
      }
    } else if (user) {
      const updatedUser = { ...user };
      localStorage.setItem('kas_remaja_admin_session', JSON.stringify(updatedUser));
      return;
    } else {
      throw new Error('Pengguna belum terautentikasi');
    }
  };

  const logout = async () => {
    localStorage.removeItem('kas_remaja_admin_session');
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
      value={{ user, loading, login, register, changePassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
