'use client';

import React, { useState } from 'react';
import { Card } from '../UI/Card';
import { Transaction } from '../../lib/dataService';
import { formatRupiah, formatDateIndonesian } from '../../lib/formatters';
import { exportTransactionsToExcel, exportReportToPDF } from '../../lib/exportUtils';
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Printer,
  Download,
  BarChart2,
} from 'lucide-react';

interface ReportsViewProps {
  transactions: Transaction[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ transactions }) => {
  const [periodPreset, setPeriodPreset] = useState<'semua' | 'bulan_ini' | 'bulan_lalu' | 'tahun_ini' | 'custom'>('semua');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Filter logic based on selected period
  const filteredTransactions = transactions.filter((tx) => {
    if (!tx.tanggal) return true;
    const txDate = new Date(tx.tanggal);
    const txYear = txDate.getFullYear();
    const txMonth = txDate.getMonth() + 1;

    if (periodPreset === 'bulan_ini') {
      return txYear === currentYear && txMonth === currentMonth;
    }
    if (periodPreset === 'bulan_lalu') {
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      return txYear === lastMonthYear && txMonth === lastMonth;
    }
    if (periodPreset === 'tahun_ini') {
      return txYear === currentYear;
    }
    if (periodPreset === 'custom') {
      let valid = true;
      if (customStart) valid = valid && tx.tanggal >= customStart;
      if (customEnd) valid = valid && tx.tanggal <= customEnd;
      return valid;
    }
    return true; // 'semua'
  });

  // Calculate summary metrics
  const totalPemasukan = filteredTransactions
    .filter((t) => t.jenis === 'Pemasukan')
    .reduce((sum, t) => sum + (t.nominal || 0), 0);

  const totalPengeluaran = filteredTransactions
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((sum, t) => sum + (t.nominal || 0), 0);

  const saldoAkhir = totalPemasukan - totalPengeluaran;

  const getPeriodeLabel = () => {
    if (periodPreset === 'bulan_ini') return 'Bulan Ini';
    if (periodPreset === 'bulan_lalu') return 'Bulan Lalu';
    if (periodPreset === 'tahun_ini') return `Tahun ${currentYear}`;
    if (periodPreset === 'custom' && customStart && customEnd) {
      return `${formatDateIndonesian(customStart)} s/d ${formatDateIndonesian(customEnd)}`;
    }
    return 'Semua Periode';
  };

  const handlePrintPDF = () => {
    exportReportToPDF(
      filteredTransactions,
      { totalPemasukan, totalPengeluaran, saldoAkhir },
      getPeriodeLabel()
    );
  };

  const handleExportExcel = () => {
    exportTransactionsToExcel(filteredTransactions, `Laporan_Kas_Remaja_${periodPreset}`);
  };

  return (
    <div className="space-y-6">
      {/* Filter Card */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              Pilih Periode Laporan Keuangan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sesuaikan data yang ingin dicetak atau diexport
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'semua', label: 'Semua Periode' },
              { id: 'bulan_ini', label: 'Bulan Ini' },
              { id: 'bulan_lalu', label: 'Bulan Lalu' },
              { id: 'tahun_ini', label: 'Tahun Ini' },
              { id: 'custom', label: 'Custom Tanggal' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriodPreset(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  periodPreset === p.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range inputs */}
        {periodPreset === 'custom' && (
          <div className="mt-4 pt-4 border-t border-red-100 dark:border-slate-700 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Mulai:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Sampai:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Pemasukan */}
        <Card className="bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Total Pemasukan
              </p>
              <h4 className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                {formatRupiah(totalPemasukan)}
              </h4>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                {filteredTransactions.filter((t) => t.jenis === 'Pemasukan').length} transaksi masuk
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Total Pengeluaran */}
        <Card className="bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                Total Pengeluaran
              </p>
              <h4 className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
                {formatRupiah(totalPengeluaran)}
              </h4>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">
                {filteredTransactions.filter((t) => t.jenis === 'Pengeluaran').length} transaksi keluar
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shrink-0">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Saldo Akhir */}
        <Card className="bg-slate-900 text-white border-slate-800 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Saldo Akhir Kas
              </p>
              <h4 className="text-2xl font-black text-white mt-1">
                {formatRupiah(saldoAkhir)}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Status: {saldoAkhir >= 0 ? 'Surplus / Sehat' : 'Defisit'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Export Action Card */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-red-200 dark:border-slate-700 bg-gradient-to-r from-red-50/60 to-rose-50/40 dark:from-slate-800 dark:to-slate-800">
        <div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-red-600" />
            Cetak & Export Laporan Official
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Unduh laporan terformat rapi dengan kop resmi organisasi remaja ({getPeriodeLabel()})
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Excel (.xlsx)
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Cetak PDF (.pdf)
          </button>
        </div>
      </Card>

      {/* Report Preview Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 dark:border-slate-700 bg-red-50/40 dark:bg-slate-800/60 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Preview Tabel Laporan ({getPeriodeLabel()})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menampilkan {filteredTransactions.length} baris transaksi
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-red-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Jenis</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4">Anggota</th>
                <th className="py-3.5 px-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50 dark:divide-slate-700/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi dalam periode ini.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-medium text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatDateIndonesian(tx.tanggal)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          tx.jenis === 'Pemasukan'
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {tx.jenis}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {tx.keterangan}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {tx.anggotaNama || '-'}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold whitespace-nowrap ${
                        tx.jenis === 'Pemasukan'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {tx.jenis === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.nominal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
