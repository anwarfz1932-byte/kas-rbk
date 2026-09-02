'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Lock, User, LogIn, ShieldCheck } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username dan password wajib diisi');
      return;
    }

    try {
      setLoading(true);
      await login(username.trim(), password);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      let msg = err.message || 'Gagal masuk ke sistem admin';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/operation-not-allowed'
      ) {
        msg = 'Username atau password salah';
      }
      setErrorMsg(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 text-base">
            Karang Taruna Guyub Rukun Blater Kidul
          </span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Login Admin Kas
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Khusus Pengurus & Bendahara Organisasi Remaja
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ADMIN KT GRBK"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:ring-2 focus:ring-red-500 outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                'Memproses...'
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Masuk Sistem Kas
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 pb-2">
        Aplikasi Pengelola Uang Kas Remaja &copy; {new Date().getFullYear()} • Berbasis Cloud Firestore
      </div>
    </div>
  );
};
