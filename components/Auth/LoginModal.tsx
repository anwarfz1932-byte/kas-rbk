'use client';

import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, LogIn, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const { login } = useAuth();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

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
      if (onSuccessToast) onSuccessToast('Berhasil masuk sebagai Admin Kas!');
      setLoading(false);
      onClose();
    } catch (err: any) {
      setLoading(false);
      let msg = err.message || 'Gagal masuk ke sistem admin';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/operation-not-allowed') {
        msg = 'Username atau password salah';
      }
      setErrorMsg(msg);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Login Admin Kas">
      <div className="space-y-4">
        {/* Header Icon & Intro */}
        <div className="text-center pb-2">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Masuk sebagai pengurus & bendahara untuk mengelola data kas
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Username Admin <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ADMIN KT GRBK"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none font-mono font-bold"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-red-600 text-red-600 bg-white hover:bg-red-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {loading ? (
                'Memproses...'
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Masuk Admin
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
