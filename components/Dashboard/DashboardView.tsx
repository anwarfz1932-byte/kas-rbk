'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  BarChart3,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ViewTab } from '../Layout/Sidebar';

interface DashboardViewProps {
  members: Member[];
  transactions: Transaction[];
  onOpenTxModal: (jenis?: 'Pemasukan' | 'Pengeluaran') => void;
  onOpenMemberModal: () => void;
  onSelectTab: (tab: ViewTab) => void;
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 text-xs space-y-1.5">
        <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">{label}</p>
        <div className="flex items-center justify-between gap-4 text-emerald-600 font-semibold">
          <span>Pemasukan:</span>
          <span>{formatRupiah(payload[0]?.value || 0)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-rose-600 font-semibold">
          <span>Pengeluaran:</span>
          <span>{formatRupiah(payload[1]?.value || 0)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  members,
  transactions,
  onOpenTxModal,
  onOpenMemberModal,
  onSelectTab,
}) => {
  const currentYear = new Date().getFullYear();
  const [chartMode, setChartMode] = useState<'year' | 'custom'>('year');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [customStart, setCustomStart] = useState<string>(`${currentYear}-01-01`);
  const [customEnd, setCustomEnd] = useState<string>(`${currentYear}-12-31`);

  // Extract available years from transactions
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentYear);
    transactions.forEach((tx) => {
      if (tx.tanggal) {
        const y = new Date(tx.tanggal).getFullYear();
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [transactions, currentYear]);

  // Compute monthly or custom chart data
  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    if (chartMode === 'year') {
      return monthNames.map((mName, index) => {
        const mPemasukan = transactions
          .filter((t) => {
            if (!t.tanggal) return false;
            const d = new Date(t.tanggal);
            return d.getFullYear() === selectedYear && d.getMonth() === index && t.jenis === 'Pemasukan';
          })
          .reduce((sum, t) => sum + (t.nominal || 0), 0);

        const mPengeluaran = transactions
          .filter((t) => {
            if (!t.tanggal) return false;
            const d = new Date(t.tanggal);
            return d.getFullYear() === selectedYear && d.getMonth() === index && t.jenis === 'Pengeluaran';
          })
          .reduce((sum, t) => sum + (t.nominal || 0), 0);

        return {
          label: mName,
          Pemasukan: mPemasukan,
          Pengeluaran: mPengeluaran,
        };
      });
    } else {
      // Custom Date Range Mode
      const start = customStart ? new Date(customStart) : new Date(`${currentYear}-01-01`);
      const end = customEnd ? new Date(customEnd) : new Date(`${currentYear}-12-31`);
      end.setHours(23, 59, 59, 999);

      const result: { label: string; Pemasukan: number; Pengeluaran: number }[] = [];
      const curr = new Date(start.getFullYear(), start.getMonth(), 1);
      const last = new Date(end.getFullYear(), end.getMonth(), 1);

      while (curr <= last) {
        const y = curr.getFullYear();
        const m = curr.getMonth();
        const mLabel = `${monthNames[m]} ${y}`;

        const mPemasukan = transactions
          .filter((t) => {
            if (!t.tanggal) return false;
            const d = new Date(t.tanggal);
            return d >= start && d <= end && d.getFullYear() === y && d.getMonth() === m && t.jenis === 'Pemasukan';
          })
          .reduce((sum, t) => sum + (t.nominal || 0), 0);

        const mPengeluaran = transactions
          .filter((t) => {
            if (!t.tanggal) return false;
            const d = new Date(t.tanggal);
            return d >= start && d <= end && d.getFullYear() === y && d.getMonth() === m && t.jenis === 'Pengeluaran';
          })
          .reduce((sum, t) => sum + (t.nominal || 0), 0);

        result.push({
          label: mLabel,
          Pemasukan: mPemasukan,
          Pengeluaran: mPengeluaran,
        });

        curr.setMonth(curr.getMonth() + 1);
      }

      return result.length > 0 ? result : monthNames.map((m) => ({ label: m, Pemasukan: 0, Pengeluaran: 0 }));
    }
  }, [transactions, chartMode, selectedYear, customStart, customEnd, currentYear]);

  // Chart totals
  const chartTotalPemasukan = useMemo(() => chartData.reduce((s, d) => s + d.Pemasukan, 0), [chartData]);
  const chartTotalPengeluaran = useMemo(() => chartData.reduce((s, d) => s + d.Pengeluaran, 0), [chartData]);
  const chartSelisih = chartTotalPemasukan - chartTotalPengeluaran;

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
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-rose-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-red-700/25">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Wallet className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-red-50 text-xs font-semibold mb-3 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Kas Remaja Merah Putih
            </div>
            <p className="text-xs sm:text-sm text-red-100/90 font-medium">Total Saldo Kas Saat Ini</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mt-1 drop-shadow-xs">
              {formatRupiah(totalSaldo)}
            </h1>
          </div>

          {/* Quick Action Buttons inside Hero Card */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenTxModal('Pemasukan')}
              className="px-4 py-2.5 rounded-xl bg-white text-red-700 hover:bg-red-50 font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              Catat Pemasukan
            </button>
            <button
              onClick={() => onOpenTxModal('Pengeluaran')}
              className="px-4 py-2.5 rounded-xl bg-red-900/60 hover:bg-red-900/80 text-white border border-red-300/30 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <MinusCircle className="w-4 h-4 text-rose-200" />
              Catat Pengeluaran
            </button>
            <button
              onClick={onOpenMemberModal}
              className="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer border border-white/20"
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
            <p className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-1">
              Saldo siap pakai
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-800">
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
          <div className="w-12 h-12 rounded-2xl bg-red-100/70 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-800">
            <Users className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Grafik Batang Recharts (Pemasukan vs Pengeluaran) */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              Grafik Perbandingan Pemasukan vs Pengeluaran
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Analisis komparatif arus kas per periode bulanan
            </p>
          </div>

          {/* Mode Filter Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setChartMode('year')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartMode === 'year'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1 Tahun ({selectedYear})
              </button>
              <button
                type="button"
                onClick={() => setChartMode('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  chartMode === 'custom'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Custom Periode
              </button>
            </div>

            {chartMode === 'year' ? (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    Tahun {y}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:ring-2 focus:ring-red-500"
                />
                <span className="text-xs text-slate-400">-</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Summary Mini Stat Pills for Chart Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Pemasukan Periode Ini</span>
            <span className="text-sm font-bold text-emerald-700">{formatRupiah(chartTotalPemasukan)}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Pengeluaran Periode Ini</span>
            <span className="text-sm font-bold text-rose-700">{formatRupiah(chartTotalPengeluaran)}</span>
          </div>
          <div className="p-3 rounded-xl bg-red-50/70 border border-red-100 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Selisih Kas</span>
            <span className={`text-sm font-bold ${chartSelisih >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {chartSelisih >= 0 ? '+' : ''}{formatRupiah(chartSelisih)}
            </span>
          </div>
        </div>

        {/* Chart Area */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={(val) => {
                  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                  return val;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <Bar
                dataKey="Pemasukan"
                name="Pemasukan (+)"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="Pengeluaran"
                name="Pengeluaran (-)"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

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
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 dark:border-slate-700 bg-red-50/40 dark:bg-slate-800/60">
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
            className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-800 flex items-center gap-1 hover:underline"
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
