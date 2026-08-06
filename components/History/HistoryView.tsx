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
  Lock,
  LogIn,
} from 'lucide-react';

interface HistoryViewProps {
  transactions: Transaction[];
  members: Member[];
  onOpenAddModal: (jenis?: 'Pemasukan' | 'Pengeluaran') => void;
  onOpenEditModal: (tx: Transaction) => void;
  onOpenDeleteConfirm: (tx: Transaction) => void;
  isAdmin?: boolean;
  onOpenLoginModal?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  members,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteConfirm,
  isAdmin = false,
  onOpenLoginModal,
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
      <Card className="p-4 sm:p-5 space-y-4 border border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-red-600" />
            Filter & Pencarian Riwayat Kas
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Secondary Buttons: White with Red border */}
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-white text-red-600 border border-red-600 hover:bg-red-50 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 rounded-xl bg-white text-red-600 border border-red-600 hover:bg-red-50 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-red-600" />
              Cetak PDF
            </button>
            {/* Primary Button or Login Button */}
            {isAdmin ? (
              <button
                onClick={() => onOpenAddModal('Pemasukan')}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Catat Transaksi
              </button>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-3.5 py-2 rounded-xl bg-white text-red-600 border border-red-600 hover:bg-red-50 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Masuk sebagai admin untuk mencatat transaksi"
              >
                <LogIn className="w-4 h-4 text-red-600" />
                Login Admin untuk Catat
              </button>
            )}
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
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-colors"
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
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none font-medium cursor-pointer"
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
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none"
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
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none"
              title="Tanggal Selesai"
            />
          </div>
        </div>

        {/* Clear Filters indicator */}
        {(searchTerm || filterJenis !== 'Semua' || startDate || endDate) && (
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">
              Ditemukan <strong className="text-slate-900">{filteredTransactions.length}</strong> data transaksi
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterJenis('Semua');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="text-red-600 hover:underline font-bold cursor-pointer"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </Card>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            {/* Header Merah dengan Teks Putih */}
            <thead>
              <tr className="bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12 border-b border-red-700">No</th>
                <th className="py-3.5 px-4 border-b border-red-700">Tanggal</th>
                <th className="py-3.5 px-4 border-b border-red-700">Jenis</th>
                <th className="py-3.5 px-4 border-b border-red-700">Keterangan</th>
                <th className="py-3.5 px-4 border-b border-red-700">Anggota</th>
                <th className="py-3.5 px-4 text-right border-b border-red-700">Nominal</th>
                <th className="py-3.5 px-4 text-center w-28 border-b border-red-700">
                  {isAdmin ? 'Aksi' : 'Akses'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada data transaksi yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-red-50/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-500">
                        {globalIndex}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {formatDateIndonesian(tx.tanggal)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            tx.jenis === 'Pemasukan'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {tx.jenis === 'Pemasukan' ? (
                            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
                          )}
                          {tx.jenis}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                        {tx.keterangan}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {tx.anggotaNama || '-'}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
                          tx.jenis === 'Pemasukan'
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {tx.jenis === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.nominal)}
                      </td>
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onOpenEditModal(tx)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Edit Transaksi"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onOpenDeleteConfirm(tx)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
                              title="Hanya Admin yang dapat mengedit/menghapus transaksi"
                            >
                              <Lock className="w-3 h-3 text-slate-400" />
                              Lihat Saja
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-white border-t border-slate-100">
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
