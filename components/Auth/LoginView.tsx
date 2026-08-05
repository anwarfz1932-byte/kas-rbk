'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Mail, Lock, User, LogIn, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, register, loginAsDemoAdmin } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email dan password wajib diisi');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter');
      return;
    }

    try {
      setLoading(true);
      if (isRegisterMode) {
        if (!name.trim()) {
          setErrorMsg('Nama lengkap pengurus wajib diisi');
          setLoading(false);
          return;
        }
        await register(email.trim(), password, name.trim());
      } else {
        await login(email.trim(), password);
      }
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      let msg = err.message || 'Gagal masuk ke sistem admin';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg = 'Email atau password salah';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email sudah terdaftar sebagai pengurus admin';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password terlalu lemah (minimal 6 karakter)';
      }
      setErrorMsg(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full pt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 dark:text-white text-base">
            Pengelola Kas Remaja
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl border border-emerald-100 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 transition-colors"
          title="Ubah Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-emerald-100 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isRegisterMode ? 'Registrasi Admin Kas' : 'Login Admin Kas'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Khusus Pengurus & Bendahara Organisasi Remaja
            </p>
          </div>

          {/* Quick Demo Access Button & Preset Credentials */}
          <div className="mb-5 space-y-2.5">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-slate-700/60 border border-emerald-200 dark:border-slate-600 text-center">
              <p className="text-xs text-emerald-900 dark:text-emerald-200 font-medium mb-2">
                Ingin langsung mencoba tanpa login Firebase?
              </p>
              <button
                type="button"
                onClick={loginAsDemoAdmin}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Masuk Langsung Mode Admin Demo
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setEmail('admin@kasremaja.org');
                setPassword('admin123');
              }}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-600"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Isi Password Default: <span className="font-mono text-emerald-700 dark:text-emerald-300">admin123</span>
            </button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-800 px-2 text-slate-400 font-semibold">
                Atau Login Firebase
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Pengurus
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Contoh: Muhammad Budi (Bendahara)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isRegisterMode}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Firebase Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="admin@kasremaja.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                'Memproses...'
              ) : isRegisterMode ? (
                <>
                  <KeyRound className="w-4 h-4" />
                  Daftar Akun Admin Baru
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Masuk Sistem Kas
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg(null);
              }}
              className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
            >
              {isRegisterMode
                ? 'Sudah punya akun admin? Login di sini'
                : 'Belum punya akun admin? Buat Akun Pengurus Baru'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500 pb-2">
        Aplikasi Pengelola Uang Kas Remaja &copy; {new Date().getFullYear()} • Berbasis Cloud Firestore
      </div>
    </div>
  );
};
