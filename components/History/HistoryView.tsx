'use client';

import React, { useState } from 'react';
import { Card } from '../UI/Card';
import { Pagination } from '../UI/Pagination';
import { Transaction, Member } from '../../lib/dataService';
import { formatDateIndonesian, formatRupiah } from '../../lib/formatters';
import { exportTransactionsToExcel, exportReportToPDF } from '../../lib/exportUtils';
import {
  Search,
  Filter,
  PlusCircle,
  FileSpreadsheet,
  FileText,
  Pencil,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';

interface HistoryViewProps {
  transactions: Transaction[];
  members: Member[];
  onOpenAddModal: (jenis?: 'Pemasukan' | 'Pengeluaran') => void;
  onOpenEditModal: (tx: Transaction) => void;
  onOpenDeleteConfirm: (tx: Transaction) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  members,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteConfirm,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterJenis, setFilterJenis] = useState<'Semua' | 'Pemasukan' | 'Pengeluaran'>('Semua');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const itemsPerPage = 10;

  // Apply filters
  const filteredTransactions = transactions.filter((tx) => {
    // Search filter
    const matchesSearch =
      tx.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.anggotaNama && tx.anggotaNama.toLowerCase().includes(searchTerm.toLowerCase()));

    // Jenis filter
    const matchesJenis = filterJenis === 'Semua' || tx.jenis === filterJenis;

    // Date range filter
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && tx.tanggal >= startDate;
    }
    if (endDate) {
      matchesDate = matchesDate && tx.tanggal <= endDate;
    }

    return matchesSearch && matchesJenis && matchesDate;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Totals for current filtered list
  const filteredPemasukan = filteredTransactions
    .filter((t) => t.jenis === 'Pemasukan')
    .reduce((sum, t) => sum + (t.nominal || 0), 0);

  const filteredPengeluaran = filteredTransactions
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((sum, t) => sum + (t.nominal || 0), 0);

  const handleExportExcel = () => {
    exportTransactionsToExcel(filteredTransactions, 'Riwayat_Kas_Remaja');
  };

  const handleExportPDF = () => {
    const periodLabel =
      startDate && endDate
        ? `${formatDateIndonesian(startDate)} s/d ${formatDateIndonesian(endDate)}`
        : 'Semua Periode';
    exportReportToPDF(
      filteredTransactions,
      {
        totalPemasukan: filteredPemasukan,
        totalPengeluaran: filteredPengeluaran,
        saldoAkhir: filteredPemasukan - filteredPengeluaran,
      },
      periodLabel
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar: Search + Date Filters + Export Buttons */}
      <Card className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-red-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Filter className="w-4 h-4 text-red-600" />
            Filter & Pencarian Riwayat
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/60 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-red-600" />
              Cetak PDF
            </button>
            <button
              onClick={() => onOpenAddModal('Pemasukan')}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Tambah Transaksi
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari keterangan / anggota..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Jenis Filter */}
          <div>
            <select
              value={filterJenis}
              onChange={(e) => {
                setFilterJenis(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-red-500 outline-none font-medium"
            >
              <option value="Semua">Semua Jenis Transaksi</option>
              <option value="Pemasukan">Khusus Pemasukan (+)</option>
              <option value="Pengeluaran">Khusus Pengeluaran (-)</option>
            </select>
          </div>

          {/* Tanggal Mulai */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-red-500 outline-none"
              title="Tanggal Mulai"
            />
          </div>

          {/* Tanggal Selesai */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-red-500 outline-none"
              title="Tanggal Selesai"
            />
          </div>
        </div>

        {/* Clear Filters indicator */}
        {(searchTerm || filterJenis !== 'Semua' || startDate || endDate) && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">
              Ditemukan <strong className="text-slate-800 dark:text-slate-200">{filteredTransactions.length}</strong> data sesuai filter
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterJenis('Semua');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="text-red-600 dark:text-red-400 hover:underline font-semibold"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </Card>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-red-100 dark:border-slate-700 bg-red-50/50 dark:bg-slate-800/80 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Jenis</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4">Anggota</th>
                <th className="py-3.5 px-4 text-right">Nominal</th>
                <th className="py-3.5 px-4 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-50 dark:divide-slate-700/60">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Tidak ada transaksi yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-slate-500">
                        {globalIndex}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatDateIndonesian(tx.tanggal)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            tx.jenis === 'Pemasukan'
                              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {tx.jenis === 'Pemasukan' ? (
                            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          {tx.jenis}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-xs">
                        {tx.keterangan}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {tx.anggotaNama || '-'}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
                          tx.jenis === 'Pemasukan'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {tx.jenis === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.nominal)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenEditModal(tx)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
                            title="Edit Transaksi"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteConfirm(tx)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-white dark:bg-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredTransactions.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </Card>
    </div>
  );
};
