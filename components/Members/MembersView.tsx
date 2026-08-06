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
  LogIn,
} from 'lucide-react';

interface MembersViewProps {
  members: Member[];
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onOpenEditModal: (member: Member) => void;
  onOpenDeleteConfirm: (member: Member) => void;
  isAdmin?: boolean;
  onOpenLoginModal?: () => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  transactions,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDeleteConfirm,
  isAdmin = false,
  onOpenLoginModal,
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
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none shadow-xs transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Add Member Button or Login Button */}
        {isAdmin ? (
          <button
            onClick={onOpenAddModal}
            className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Anggota
          </button>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="px-4 py-2.5 rounded-2xl bg-white text-red-600 border border-red-600 hover:bg-red-50 font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <LogIn className="w-4 h-4 text-red-600" />
            Login Admin untuk Tambah
          </button>
        )}
      </div>

      {/* Member Table Card */}
      <Card className="p-0 overflow-hidden border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12 border-b border-red-700">No</th>
                <th className="py-3.5 px-4 border-b border-red-700">Nama Anggota</th>
                <th className="py-3.5 px-4 border-b border-red-700">Jabatan / Peran</th>
                <th className="py-3.5 px-4 border-b border-red-700">No. HP / WA</th>
                <th className="py-3.5 px-4 text-right border-b border-red-700">Total Iuran</th>
                <th className="py-3.5 px-4 text-center w-32 border-b border-red-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
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
                      className="hover:bg-red-50/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-500">
                        {globalIndex}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {member.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span>{member.nama}</span>
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {memberTxs.length} catatan transaksi
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                          <Shield className="w-3 h-3 text-red-600" />
                          {member.jabatan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {member.noHp ? (
                          <a
                            href={`https://wa.me/${member.noHp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-red-600 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-red-600" />
                            {member.noHp}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                        {formatRupiah(totalIuran)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {/* View Member History */}
                          <button
                            onClick={() => setSelectedMemberForHistory(member)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Riwayat Transaksi Anggota"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Edit Button - Admin Only */}
                          {isAdmin && (
                            <button
                              onClick={() => onOpenEditModal(member)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Edit Anggota"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                          {/* Delete Button - Admin Only */}
                          {isAdmin && (
                            <button
                              onClick={() => onOpenDeleteConfirm(member)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Hapus Anggota"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
        <div className="p-4 bg-white border-t border-slate-100">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white text-red-600 font-bold flex items-center justify-center text-sm shadow-xs">
                  {selectedMemberForHistory.nama.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {selectedMemberForHistory.nama}
                  </h3>
                  <p className="text-xs text-red-100 font-medium">
                    {selectedMemberForHistory.jabatan}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMemberForHistory(null)}
                className="p-1 rounded-lg text-red-100 hover:text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 bg-white">
              {/* Member stats box */}
              {(() => {
                const memberTxs = getMemberTransactions(selectedMemberForHistory);
                const totalSetor = memberTxs
                  .filter((t) => t.jenis === 'Pemasukan')
                  .reduce((sum, t) => sum + (t.nominal || 0), 0);

                return (
                  <>
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 font-semibold">Total Setoran / Iuran</p>
                        <p className="text-xl font-black text-emerald-700 mt-0.5">
                          {formatRupiah(totalSetor)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 font-semibold">Total Transaksi</p>
                        <p className="text-base font-bold text-slate-900 mt-0.5">
                          {memberTxs.length} catatan
                        </p>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pt-2">
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
                            className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-900">
                                {tx.keterangan}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {formatDateIndonesian(tx.tanggal)}
                              </p>
                            </div>
                            <span
                              className={`text-xs font-bold ${
                                tx.jenis === 'Pemasukan' ? 'text-emerald-600' : 'text-red-600'
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
