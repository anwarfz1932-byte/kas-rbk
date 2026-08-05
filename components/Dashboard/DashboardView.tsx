'use client';

import React from 'react';
import { Card } from '../UI/Card';
import { Member, Transaction } from '../../lib/dataService';
import { formatRupiah, formatDateIndonesian } from '../../lib/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  PlusCircle,
  MinusCircle,
  UserPlus,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { ViewTab } from '../Layout/Sidebar';

interface DashboardViewProps {
  members: Member[];
  transactions: Transaction[];
  onOpenTxModal: (jenis?: 'Pemasukan' | 'Pengeluaran') => void;
  onOpenMemberModal: () => void;
  onSelectTab: (tab: ViewTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  members,
  transactions,
  onOpenTxModal,
  onOpenMemberModal,
  onSelectTab,
}) => {
  // Calculations
  const totalPemasukan = transactions
    .filter((t) => t.jenis === 'Pemasukan')
    .reduce((sum, t) => sum + (t.nominal || 0), 0);

  const totalPengeluaran = transactions
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((sum, t) => sum + (t.nominal || 0), 0);

  const totalSaldo = totalPemasukan - totalPengeluaran;
  const jumlahAnggota = members.length;

  const recentTransactions = transactions.slice(0, 5);

  const totalVolume = totalPemasukan + totalPengeluaran;
  const pemasukanPercent = totalVolume > 0 ? Math.round((totalPemasukan / totalVolume) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner Card - Total Saldo */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-emerald-700/20">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Wallet className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              Saldo Aktif Kas Remaja
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">Total Saldo Kas Saat Ini</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mt-1">
              {formatRupiah(totalSaldo)}
            </h1>
          </div>

          {/* Quick Action Buttons inside Hero Card */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenTxModal('Pemasukan')}
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Catat Pemasukan
            </button>
            <button
              onClick={() => onOpenTxModal('Pengeluaran')}
              className="px-4 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-900/80 text-white border border-emerald-400/30 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <MinusCircle className="w-4 h-4 text-rose-300" />
              Catat Pengeluaran
            </button>
            <button
              onClick={onOpenMemberModal}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Anggota Baru
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo Card */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Saldo Kas</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {formatRupiah(totalSaldo)}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Saldo siap pakai
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800">
            <Wallet className="w-6 h-6" />
          </div>
        </Card>

        {/* Total Pemasukan Card */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pemasukan</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatRupiah(totalPemasukan)}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Akumulasi iuran & donasi
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>

        {/* Total Pengeluaran Card */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Pengeluaran</p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {formatRupiah(totalPengeluaran)}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Akumulasi biaya kegiatan
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-800">
            <TrendingDown className="w-6 h-6" />
          </div>
        </Card>

        {/* Jumlah Anggota Card */}
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Jumlah Anggota</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {jumlahAnggota} <span className="text-sm font-normal text-slate-500">Orang</span>
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Terdaftar di database
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-800">
            <Users className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Visual Arus Kas Progress Bar */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Rasio Arus Kas Organisasi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perbandingan Pemasukan ({pemasukanPercent}%) vs Pengeluaran ({100 - pemasukanPercent}%)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {totalSaldo >= 0 ? 'Kondisi Kas Sehat' : 'Defisit Kas'}
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${pemasukanPercent}%` }}
            title={`Pemasukan: ${pemasukanPercent}%`}
          />
          <div
            className="bg-rose-500 h-full transition-all duration-500"
            style={{ width: `${100 - pemasukanPercent}%` }}
            title={`Pengeluaran: ${100 - pemasukanPercent}%`}
          />
        </div>
      </Card>

      {/* Recent Transactions Preview Section */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 dark:border-slate-700 bg-emerald-50/40 dark:bg-slate-800/60">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Transaksi Terakhir
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              5 catatan kas paling baru
            </p>
          </div>
          <button
            onClick={() => onSelectTab('history')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            Lihat Semua
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            Belum ada transaksi recorded.
          </div>
        ) : (
          <div className="divide-y divide-emerald-50 dark:divide-slate-700/60">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.jenis === 'Pemasukan'
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.jenis === 'Pemasukan' ? (
                      <ArrowDownRight className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {tx.keterangan}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      <span>{formatDateIndonesian(tx.tanggal)}</span>
                      <span>•</span>
                      <span>{tx.anggotaNama || 'Umum'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      tx.jenis === 'Pemasukan'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.jenis === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.nominal)}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                      tx.jenis === 'Pemasukan'
                        ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {tx.jenis}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
