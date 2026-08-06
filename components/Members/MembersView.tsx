'use client';

import React, { useState } from 'react';
import { Card } from '../UI/Card';
import { Pagination } from '../UI/Pagination';
import { Member, Transaction } from '../../lib/dataService';
import { formatDateIndonesian, formatRupiah } from '../../lib/formatters';
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  Phone,
  Shield,
  Receipt,
  Eye,
  X,
  UserCheck,
} from 'lucide-react';

interface MembersViewProps {
  members: Member[];
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onOpenEditModal: (member: Member) => void;
  onOpenDeleteConfirm: (member: Member) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  transactions,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteConfirm,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedMemberForHistory, setSelectedMemberForHistory] = useState<Member | null>(null);

  const itemsPerPage = 8;

  // Filter members by search term
  const filteredMembers = members.filter(
    (m) =>
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate transaction history for a member
  const getMemberTransactions = (member: Member) => {
    return transactions.filter(
      (t) => t.anggota === member.id || t.anggotaNama?.toLowerCase() === member.nama.toLowerCase()
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama anggota atau jabatan..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-red-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-red-500 outline-none shadow-xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Add Member Button */}
        <button
          onClick={onOpenAddModal}
          className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Anggota
        </button>
      </div>

      {/* Member Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-red-100 dark:border-slate-700 bg-red-50/50 dark:bg-slate-800/80 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">Nama Anggota</th>
                <th className="py-3.5 px-4">Jabatan / Peran</th>
                <th className="py-3.5 px-4">No. HP / WA</th>
                <th className="py-3.5 px-4 text-right">Total Iuran</th>
                <th className="py-3.5 px-4 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-50 dark:divide-slate-700/60">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    {searchTerm ? 'Tidak ada anggota yang cocok dengan pencarian.' : 'Belum ada anggota terdaftar.'}
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member, index) => {
                  const memberTxs = getMemberTransactions(member);
                  const totalIuran = memberTxs
                    .filter((t) => t.jenis === 'Pemasukan')
                    .reduce((sum, t) => sum + (t.nominal || 0), 0);

                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-medium text-slate-500">
                        {globalIndex}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 font-bold flex items-center justify-center text-xs shrink-0">
                          {member.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span>{member.nama}</span>
                          <span className="block text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                            {memberTxs.length} transaksi recorded
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 dark:bg-slate-800 text-red-700 dark:text-red-300 border border-red-100 dark:border-slate-700">
                          <Shield className="w-3 h-3 text-red-600" />
                          {member.jabatan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {member.noHp ? (
                          <a
                            href={`https://wa.me/${member.noHp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <Phone className="w-3.5 h-3.5 text-red-600" />
                            {member.noHp}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(totalIuran)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {/* View Member History */}
                          <button
                            onClick={() => setSelectedMemberForHistory(member)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
                            title="Riwayat Transaksi Anggota"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Edit Button */}
                          <button
                            onClick={() => onOpenEditModal(member)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors"
                            title="Edit Anggota"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => onOpenDeleteConfirm(member)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 transition-colors"
                            title="Hapus Anggota"
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

        {/* Pagination Controls */}
        <div className="p-4 bg-white dark:bg-slate-800">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredMembers.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </Card>

      {/* Member Transaction Details Modal */}
      {selectedMemberForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 border border-red-100 dark:border-slate-700 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 dark:border-slate-700 bg-red-50/50 dark:bg-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm">
                  {selectedMemberForHistory.nama.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedMemberForHistory.nama}
                  </h3>
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    {selectedMemberForHistory.jabatan}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMemberForHistory(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* Member stats box */}
              {(() => {
                const memberTxs = getMemberTransactions(selectedMemberForHistory);
                const totalSetor = memberTxs
                  .filter((t) => t.jenis === 'Pemasukan')
                  .reduce((sum, t) => sum + (t.nominal || 0), 0);

                return (
                  <>
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-slate-800/80 border border-red-100 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Setoran / Iuran</p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          {formatRupiah(totalSetor)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Transaksi</p>
                        <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {memberTxs.length} catatan
                        </p>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pt-2">
                      Riwayat Pembayaran Kas
                    </h4>

                    {memberTxs.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-sm">
                        Belum ada riwayat transaksi recorded untuk anggota ini.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {memberTxs.map((tx) => (
                          <div
                            key={tx.id}
                            className="p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                {tx.keterangan}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {formatDateIndonesian(tx.tanggal)}
                              </p>
                            </div>
                            <span
                              className={`text-xs font-bold ${
                                tx.jenis === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {tx.jenis === 'Pemasukan' ? '+' : '-'} {formatRupiah(tx.nominal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
