'use client';

import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Member } from '../../lib/dataService';
import { User, Phone, Shield } from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Member, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: Member | null;
}

const MemberForm: React.FC<{
  onClose: () => void;
  onSubmit: (data: Omit<Member, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: Member | null;
}> = ({ onClose, onSubmit, initialData }) => {
  const [nama, setNama] = useState<string>(initialData?.nama || '');
  const [jabatan, setJabatan] = useState<string>(initialData?.jabatan || 'Anggota Active');
  const [noHp, setNoHp] = useState<string>(initialData?.noHp || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nama.trim()) {
      setErrorMsg('Nama anggota wajib diisi');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        nama: nama.trim(),
        jabatan: jabatan.trim() || 'Anggota Active',
        noHp: noHp.trim(),
      });
      setLoading(false);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Gagal menyimpan data anggota');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Nama */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Nama Lengkap <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Contoh: Muhammad Rizky"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
          />
        </div>
      </div>

      {/* Jabatan / Peranan */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Jabatan / Peranan dalam Organisasi
        </label>
        <div className="relative">
          <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={jabatan}
            onChange={(e) => setJabatan(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
          >
            <option value="Ketua Remaja">Ketua Remaja</option>
            <option value="Wakil Ketua">Wakil Ketua</option>
            <option value="Bendahara Kas">Bendahara Kas</option>
            <option value="Sekretaris">Sekretaris</option>
            <option value="Humas & Media">Humas & Media</option>
            <option value="Anggota Active">Anggota Active</option>
          </select>
        </div>
      </div>

      {/* No HP */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Nomor WhatsApp / HP
        </label>
        <div className="relative">
          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Contoh: 081234567890"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium text-sm transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          {loading ? 'Menyimpan...' : 'Simpan Data Anggota'}
        </button>
      </div>
    </form>
  );
};

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Data Anggota' : 'Tambah Anggota Remaja'}
    >
      <MemberForm
        key={initialData?.id || 'new-member'}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={initialData}
      />
    </Modal>
  );
};
