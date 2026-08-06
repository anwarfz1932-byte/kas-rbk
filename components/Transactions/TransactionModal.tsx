'use client';

import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Member, Transaction } from '../../lib/dataService';
import { getTodayDateString, formatRupiah } from '../../lib/formatters';
import { ArrowDownRight, ArrowUpRight, DollarSign, Calendar, FileText } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: Transaction | null;
  members: Member[];
  defaultJenis?: 'Pemasukan' | 'Pengeluaran';
}

const TransactionForm: React.FC<{
  onClose: () => void;
  onSubmit: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  initialData?: Transaction | null;
  members: Member[];
  defaultJenis?: 'Pemasukan' | 'Pengeluaran';
}> = ({ onClose, onSubmit, initialData, defaultJenis = 'Pemasukan' }) => {
  const [jenis, setJenis] = useState<'Pemasukan' | 'Pengeluaran'>(
    initialData?.jenis || defaultJenis
  );
  const [tanggal, setTanggal] = useState<string>(
    initialData?.tanggal || getTodayDateString()
  );
  const [nominal, setNominal] = useState<string>(
    initialData?.nominal ? initialData.nominal.toString() : ''
  );
  const [keterangan, setKeterangan] = useState<string>(initialData?.keterangan || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsedNominal = parseFloat(nominal);

    if (!tanggal) {
      setErrorMsg('Tanggal transaksi wajib diisi');
      return;
    }

    if (isNaN(parsedNominal) || parsedNominal <= 0) {
      setErrorMsg('Nominal transaksi harus berupa angka lebih dari 0 (Rp 0)');
      return;
    }

    if (!keterangan.trim()) {
      setErrorMsg('Keterangan transaksi wajib diisi');
      return;
    }

    try {
      setLoading(true);
      const txPayload: Omit<Transaction, 'id' | 'createdAt'> = {
        tanggal,
        jenis,
        nominal: parsedNominal,
        keterangan: keterangan.trim(),
        anggotaNama: initialData?.anggotaNama || 'Kas Remaja',
      };
      if (initialData?.anggota) {
        txPayload.anggota = initialData.anggota;
      }
      await onSubmit(txPayload);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Gagal menyimpan transaksi');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Jenis Transaksi Switch */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Jenis Transaksi <span className="text-red-600">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setJenis('Pemasukan')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
              jenis === 'Pemasukan'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-emerald-50'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            Pemasukan (+)
          </button>
          <button
            type="button"
            onClick={() => setJenis('Pengeluaran')}
            className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-xs sm:text-sm border transition-all cursor-pointer ${
              jenis === 'Pengeluaran'
                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-red-50'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Pengeluaran (-)
          </button>
        </div>
      </div>

      {/* Tanggal */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Tanggal Transaksi <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none"
          />
        </div>
      </div>

      {/* Nominal */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Nominal (Rp) <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="number"
            min="1"
            placeholder="Contoh: 50000"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            required
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none font-bold"
          />
        </div>
        {nominal && !isNaN(parseFloat(nominal)) && parseFloat(nominal) > 0 && (
          <p className="text-xs text-red-600 mt-1 font-bold">
            Format: {formatRupiah(parseFloat(nominal))}
          </p>
        )}
      </div>

      {/* Anggota */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Pilih Anggota {jenis === 'Pemasukan' ? '(Opsional / Sumber Iuran)' : '(Opsional)'}
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={anggotaId}
            onChange={(e) => setAnggotaId(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none cursor-pointer"
          >
            <option value="">-- Umum / Non-Anggota --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nama} ({m.jabatan || 'Anggota'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Keterangan */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Keterangan / Rincian <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <textarea
            rows={3}
            placeholder="Contoh: Uang Kas Bulanan Agustus / Pembelian Konsumsi Rapat"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            required
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
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
          className="flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer active:scale-95"
        >
          {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
        </button>
      </div>
    </form>
  );
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  members,
  defaultJenis = 'Pemasukan',
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaksi Kas' : 'Tambah Transaksi Kas'}
    >
      <TransactionForm
        key={initialData?.id || `new-tx-${defaultJenis}`}
        onClose={onClose}
        onSubmit={onSubmit}
        initialData={initialData}
        members={members}
        defaultJenis={defaultJenis}
      />
    </Modal>
  );
};
