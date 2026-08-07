'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '../UI/Card';
import { Member, Transaction } from '../../lib/dataService';
import { formatRupiah, formatDateIndonesian } from '../../lib/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  MinusCircle,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Users,
  Activity,
  Receipt,
  Lock,
  LogIn,
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
  onOpenMemberModal?: () => void;
  onSelectTab: (tab: ViewTab) => void;
  isAdmin?: boolean;
  onOpenLoginModal?: () => void;
}

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3.5 rounded-xl shadow-lg border border-slate-200 text-xs space-y-1.5">
        <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">{label}</p>
        <div className="flex items-center justify-between gap-4 text-emerald-600 font-semibold">
          <span>Pemasukan:</span>
          <span>{formatRupiah(payload[0]?.value || 0)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-red-600 font-semibold">
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
  isAdmin = false,
  onOpenLoginModal,
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

  // Total Calculations
  const totalPemasukan = transactions
    .filter((t) => t.jenis === 'Pemasukan')
    .reduce((sum, t) => sum + (t.nominal || 0), 0);

  const totalPengeluaran = transactions
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((sum, t) => sum + (t.nominal || 0), 0);

  const totalSaldo = totalPemasukan - totalPengeluaran;
  const recentTransactions = transactions.slice(0, 5);

  const totalVolume = totalPemasukan + totalPengeluaran;
  const pemasukanPercent = totalVolume > 0 ? Math.round((totalPemasukan / totalVolume) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner Hero Card - Total Saldo */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-red-700">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Wallet className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-red-50 text-xs font-semibold mb-3 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Remaja Blater Kidul
            </div>
            <p className="text-xs sm:text-sm text-red-100 font-medium">Total Saldo Kas Saat Ini</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mt-1">
              {formatRupiah(totalSaldo)}
            </h1>
          </div>

          {/* Quick Action Buttons inside Hero Card */}
          <div className="flex flex-wrap items-center gap-2.5">
            {isAdmin ? (
              <>
                <button
                  onClick={() => onOpenTxModal('Pemasukan')}
                  className="px-4 py-2.5 rounded-xl bg-white text-red-700 hover:bg-red-50 font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  Catat Pemasukan
                </button>
                <button
                  onClick={() => onOpenTxModal('Pengeluaran')}
                  className="px-4 py-2.5 rounded-xl bg-red-800/80 hover:bg-red-900 text-white border border-red-400/40 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <MinusCircle className="w-4 h-4 text-red-200" />
                  Catat Pengeluaran
                </button>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={onOpenLoginModal}
                  className="px-4 py-2.5 rounded-xl bg-white text-red-700 hover:bg-red-50 font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-red-600" />
                  Login Admin untuk Catat
                </button>
                <div className="px-3.5 py-2.5 rounded-xl bg-red-900/60 text-red-100 border border-red-400/30 text-xs font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-red-200" />
                  Mode Lihat Saja
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Kas */}
        <Card className="flex items-center justify-between bg-white border border-slate-200/80 hover:border-red-200">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Kas</p>
            <p className="text-xl font-black text-slate-900 mt-1">
              {formatRupiah(totalSaldo)}
            </p>
            <p className="text-[11px] text-red-600 font-semibold mt-1">
              Kas Siap Pakai
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <Wallet className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 2: Total Pemasukan */}
        <Card className="flex items-center justify-between bg-white border border-slate-200/80 hover:border-emerald-200">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pemasukan</p>
            <p className="text-xl font-black text-emerald-600 mt-1">
              {formatRupiah(totalPemasukan)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Akumulasi Kas Masuk
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 3: Total Pengeluaran */}
        <Card className="flex items-center justify-between bg-white border border-slate-200/80 hover:border-red-200">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pengeluaran</p>
            <p className="text-xl font-black text-red-600 mt-1">
              {formatRupiah(totalPengeluaran)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Akumulasi Biaya Kegiatan
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
            <TrendingDown className="w-6 h-6" />
          </div>
        </Card>

        {/* Card 4: Total Transaksi & Anggota */}
        <Card className="flex items-center justify-between bg-white border border-slate-200/80 hover:border-slate-300">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Transaksi</p>
            <p className="text-xl font-black text-slate-900 mt-1">
              {transactions.length} <span className="text-xs font-medium text-slate-500">Catatan</span>
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Tercatat dalam sistem kas
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
            <Receipt className="w-6 h-6 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Grafik Batang Recharts (Pemasukan vs Pengeluaran) */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-600" />
              Grafik Pemasukan dan Pengeluaran Kas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Analisis perbandingan arus kas bulanan
            </p>
          </div>

          {/* Mode Filter Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setChartMode('year')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
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
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 outline-none focus:ring-2 focus:ring-red-500"
                />
                <span className="text-xs text-slate-400">-</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-700 outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Summary Mini Stat Pills for Chart Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
            <span className="text-xs text-slate-700 font-semibold">Pemasukan Periode Ini</span>
            <span className="text-sm font-bold text-emerald-700">{formatRupiah(chartTotalPemasukan)}</span>
          </div>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200/80 flex items-center justify-between">
            <span className="text-xs text-slate-700 font-semibold">Pengeluaran Periode Ini</span>
            <span className="text-sm font-bold text-red-700">{formatRupiah(chartTotalPengeluaran)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-700 font-semibold">Selisih Kas</span>
            <span className={`text-sm font-bold ${chartSelisih >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
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
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={(val) => {
                  if (val >= 1000000) {
                    const million = val / 1000000;
                    return `${million % 1 === 0 ? million : million.toFixed(1)} Jt`;
                  }
                  if (val >= 1000) {
                    const thousand = val / 1000;
                    return `${thousand % 1 === 0 ? thousand : thousand.toFixed(0)} Rb`;
                  }
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
                fill="#dc2626"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Visual Arus Kas Progress Bar */}
      <Card className="bg-white border border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Rasio Arus Kas Organisasi
            </h3>
            <p className="text-xs text-slate-500">
              Perbandingan Pemasukan ({pemasukanPercent}%) vs Pengeluaran ({100 - pemasukanPercent}%)
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
            {totalSaldo >= 0 ? 'Kondisi Kas Sehat' : 'Defisit Kas'}
          </span>
        </div>
        <div className="w-full h-3.5 rounded-full bg-slate-100 overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${pemasukanPercent}%` }}
            title={`Pemasukan: ${pemasukanPercent}%`}
          />
          <div
            className="bg-red-500 h-full transition-all duration-500"
            style={{ width: `${100 - pemasukanPercent}%` }}
            title={`Pengeluaran: ${100 - pemasukanPercent}%`}
          />
        </div>
      </Card>

      {/* Recent Transactions Preview Section */}
      <Card className="p-0 overflow-hidden border border-slate-200/80">
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-600 text-white">
          <div>
            <h3 className="text-base font-bold text-white">
              Transaksi Terakhir
            </h3>
            <p className="text-xs text-red-100">
              5 catatan kas paling baru
            </p>
          </div>
          <button
            onClick={() => onSelectTab('history')}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white text-red-700 hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Belum ada transaksi recorded.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 bg-white">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-red-50/30 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.jenis === 'Pemasukan'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    }`}
                  >
                    {tx.jenis === 'Pemasukan' ? (
                      <ArrowDownRight className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {tx.keterangan}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>{formatDateIndonesian(tx.tanggal)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      tx.jenis === 'Pemasukan'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {tx.jenis === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.nominal)}
                  </p>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                      tx.jenis === 'Pemasukan'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
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
