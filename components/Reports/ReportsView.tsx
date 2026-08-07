'use client';

import React, { useState } from 'react';
import { Card } from '../UI/Card';
import { Transaction } from '../../lib/dataService';
import { formatRupiah, formatDateIndonesian } from '../../lib/formatters';
import { exportTransactionsToExcel, exportReportToPDF } from '../../lib/exportUtils';
import {
  FileSpreadsheet,
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Printer,
  Download,
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

  // Calculate summary metrics for filtered period
  const totalPemasukan = filteredTransactions
    .filter((t) => t.jenis === 'Pemasukan')
    .reduce((sum, t) => sum + (t.nominal || 0), 0);

  const totalPengeluaran = filteredTransactions
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((sum, t) => sum + (t.nominal || 0), 0);

  const saldoPeriode = totalPemasukan - totalPengeluaran;

  // Calculate cumulative all-time total cash balance
  const totalSemuaPemasukan = transactions
    .filter((t) => t.jenis === 'Pemasukan')
    .reduce((sum, t) => sum + (t.nominal || 0), 0);

  const totalSemuaPengeluaran = transactions
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((sum, t) => sum + (t.nominal || 0), 0);

  const totalSaldoKas = totalSemuaPemasukan - totalSemuaPengeluaran;

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
      { totalPemasukan, totalPengeluaran, saldoAkhir: totalSaldoKas },
      getPeriodeLabel()
    );
  };

  const handleExportExcel = () => {
    exportTransactionsToExcel(filteredTransactions, `Laporan_Kas_Remaja_${periodPreset}`);
  };

  return (
    <div className="space-y-6">
      {/* Filter Card */}
      <Card className="p-5 border-slate-200 shadow-sm bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              Pilih Periode Laporan Keuangan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  periodPreset === p.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range inputs */}
        {periodPreset === 'custom' && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-700 font-bold">Mulai:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none font-bold"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-700 font-bold">Sampai:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none font-bold"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pemasukan */}
        <Card className="bg-white border-emerald-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Total Pemasukan
              </p>
              <h4 className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                {formatRupiah(totalPemasukan)}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {filteredTransactions.filter((t) => t.jenis === 'Pemasukan').length} transaksi ({getPeriodeLabel()})
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Total Pengeluaran */}
        <Card className="bg-white border-red-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-800 uppercase tracking-wider">
                Total Pengeluaran
              </p>
              <h4 className="text-xl sm:text-2xl font-black text-red-600 mt-1">
                {formatRupiah(totalPengeluaran)}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {filteredTransactions.filter((t) => t.jenis === 'Pengeluaran').length} transaksi ({getPeriodeLabel()})
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Arus Kas Periode */}
        <Card className="bg-white border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Arus Kas Periode
              </p>
              <h4 className={`text-xl sm:text-2xl font-black mt-1 ${
                saldoPeriode >= 0 ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {saldoPeriode >= 0 ? `+${formatRupiah(saldoPeriode)}` : formatRupiah(saldoPeriode)}
              </h4>
              <p className={`text-[11px] font-bold mt-1 ${
                saldoPeriode >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {saldoPeriode >= 0 ? 'Surplus Periode' : 'Defisit Periode'}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              saldoPeriode >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Saldo Akhir Kas */}
        <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 text-white border-slate-800 shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-300 uppercase tracking-wider">
                Saldo Akhir Kas
              </p>
              <h4 className="text-xl sm:text-2xl font-black text-white mt-1">
                {formatRupiah(totalSaldoKas)}
              </h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  totalSaldoKas >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {totalSaldoKas >= 0 ? 'Kas Sehat / Tersedia' : 'Kas Defisit'}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Export Action Card */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-red-200 bg-red-50/60 shadow-xs">
        <div>
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Printer className="w-5 h-5 text-red-600" />
            Cetak & Export Laporan Official
          </h4>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Unduh laporan terformat rapi dengan kop resmi organisasi remaja ({getPeriodeLabel()})
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Excel (.xlsx)
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" />
            Cetak PDF (.pdf)
          </button>
        </div>
      </Card>

      {/* Report Preview Table */}
      <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-800">
              Preview Tabel Laporan ({getPeriodeLabel()})
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan {filteredTransactions.length} baris transaksi
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Jenis</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada transaksi dalam periode ini.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-red-50/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                      {formatDateIndonesian(tx.tanggal)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          tx.jenis === 'Pemasukan'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {tx.jenis}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {tx.keterangan}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-black whitespace-nowrap ${
                        tx.jenis === 'Pemasukan'
                          ? 'text-emerald-600'
                          : 'text-red-600'
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
