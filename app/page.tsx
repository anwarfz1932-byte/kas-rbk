'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar, ViewTab } from '../components/Layout/Sidebar';
import { Navbar } from '../components/Layout/Navbar';
import { DashboardView } from '../components/Dashboard/DashboardView';
import { MembersView } from '../components/Members/MembersView';
import { HistoryView } from '../components/History/HistoryView';
import { ReportsView } from '../components/Reports/ReportsView';
import { LoginView } from '../components/Auth/LoginView';
import { ChangePasswordModal } from '../components/Auth/ChangePasswordModal';
import { TransactionModal } from '../components/Transactions/TransactionModal';
import { MemberModal } from '../components/Members/MemberModal';
import { ConfirmModal } from '../components/UI/ConfirmModal';
import { ToastContainer, ToastMessage } from '../components/UI/Toast';
import {
  Member,
  Transaction,
  subscribeMembers,
  subscribeTransactions,
  addMemberData,
  updateMemberData,
  deleteMemberData,
  addTransactionData,
  updateTransactionData,
  deleteTransactionData,
} from '../lib/dataService';
import { Loader2 } from 'lucide-react';

export default function MainPage() {
  const { user, loading: authLoading } = useAuth();

  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Data states
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [txModalDefaultJenis, setTxModalDefaultJenis] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);

  // Delete confirm modals state
  const [deleteTxTarget, setDeleteTxTarget] = useState<Transaction | null>(null);
  const [deleteMemberTarget, setDeleteMemberTarget] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Toast helper
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Subscribe to Firestore data
  useEffect(() => {
    if (!user) return;

    let memberLoaded = false;
    let txLoaded = false;

    const checkDone = () => {
      if (memberLoaded && txLoaded) {
        setDataLoading(false);
      }
    };

    const unsubMembers = subscribeMembers((data) => {
      setMembers(data);
      memberLoaded = true;
      checkDone();
    });

    const unsubTx = subscribeTransactions((data) => {
      setTransactions(data);
      txLoaded = true;
      checkDone();
    });

    return () => {
      unsubMembers();
      unsubTx();
    };
  }, [user]);

  // Handlers for Transactions
  const handleOpenAddTx = (jenis: 'Pemasukan' | 'Pengeluaran' = 'Pemasukan') => {
    setEditingTx(null);
    setTxModalDefaultJenis(jenis);
    setIsTxModalOpen(true);
  };

  const handleOpenEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleSubmitTx = async (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTx) {
      await updateTransactionData(editingTx.id, txData);
      addToast('success', `Berhasil memperbarui transaksi ${txData.keterangan}`);
    } else {
      await addTransactionData({
        ...txData,
        createdAt: new Date().toISOString(),
      });
      addToast('success', `Berhasil mencatat transaksi ${txData.jenis} Rp ${txData.nominal.toLocaleString('id-ID')}`);
    }
  };

  const handleConfirmDeleteTx = async () => {
    if (!deleteTxTarget) return;
    try {
      setActionLoading(true);
      await deleteTransactionData(deleteTxTarget.id);
      addToast('success', `Transaksi "${deleteTxTarget.keterangan}" telah dihapus.`);
      setDeleteTxTarget(null);
    } catch (err: any) {
      addToast('error', 'Gagal menghapus transaksi: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers for Members
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (m: Member) => {
    setEditingMember(m);
    setIsMemberModalOpen(true);
  };

  const handleSubmitMember = async (memberData: Omit<Member, 'id' | 'createdAt'>) => {
    if (editingMember) {
      await updateMemberData(editingMember.id, memberData);
      addToast('success', `Data anggota ${memberData.nama} berhasil diperbarui.`);
    } else {
      await addMemberData({
        ...memberData,
        createdAt: new Date().toISOString(),
      });
      addToast('success', `Anggota baru ${memberData.nama} berhasil ditambahkan.`);
    }
  };

  const handleConfirmDeleteMember = async () => {
    if (!deleteMemberTarget) return;
    try {
      setActionLoading(true);
      await deleteMemberData(deleteMemberTarget.id);
      addToast('success', `Anggota "${deleteMemberTarget.nama}" telah dihapus.`);
      setDeleteMemberTarget(null);
    } catch (err: any) {
      addToast('error', 'Gagal menghapus anggota: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Render Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-emerald-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Memuat Sistem Kas Remaja...
        </p>
      </div>
    );
  }

  // Render Login view if user is not logged in
  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex text-slate-800 dark:text-slate-100 transition-colors">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Sidebar Component */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {dataLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
              <p className="text-xs font-semibold">Mengambil data kas dari Firestore...</p>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  members={members}
                  transactions={transactions}
                  onOpenTxModal={handleOpenAddTx}
                  onOpenMemberModal={handleOpenAddMember}
                  onSelectTab={setCurrentTab}
                />
              )}

              {currentTab === 'members' && (
                <MembersView
                  members={members}
                  transactions={transactions}
                  onOpenAddModal={handleOpenAddMember}
                  onOpenEditModal={handleOpenEditMember}
                  onOpenDeleteConfirm={setDeleteMemberTarget}
                />
              )}

              {currentTab === 'transactions' && (
                <HistoryView
                  transactions={transactions}
                  members={members}
                  onOpenAddModal={handleOpenAddTx}
                  onOpenEditModal={handleOpenEditTx}
                  onOpenDeleteConfirm={setDeleteTxTarget}
                />
              )}

              {currentTab === 'history' && (
                <HistoryView
                  transactions={transactions}
                  members={members}
                  onOpenAddModal={handleOpenAddTx}
                  onOpenEditModal={handleOpenEditTx}
                  onOpenDeleteConfirm={setDeleteTxTarget}
                />
              )}

              {currentTab === 'reports' && <ReportsView transactions={transactions} />}
            </>
          )}
        </main>
      </div>

      {/* Modal Transaction Form */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSubmit={handleSubmitTx}
        initialData={editingTx}
        members={members}
        defaultJenis={txModalDefaultJenis}
      />

      {/* Modal Member Form */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSubmit={handleSubmitMember}
        initialData={editingMember}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccessToast={(msg) => addToast('success', msg)}
      />

      {/* Confirm Delete Transaction Modal */}
      <ConfirmModal
        isOpen={!!deleteTxTarget}
        onClose={() => setDeleteTxTarget(null)}
        onConfirm={handleConfirmDeleteTx}
        title="Hapus Transaksi Kas"
        message={`Apakah Anda yakin ingin menghapus transaksi "${deleteTxTarget?.keterangan}" (${deleteTxTarget?.jenis} Rp ${deleteTxTarget?.nominal.toLocaleString('id-ID')})? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={actionLoading}
      />

      {/* Confirm Delete Member Modal */}
      <ConfirmModal
        isOpen={!!deleteMemberTarget}
        onClose={() => setDeleteMemberTarget(null)}
        onConfirm={handleConfirmDeleteMember}
        title="Hapus Data Anggota"
        message={`Apakah Anda yakin ingin menghapus anggota "${deleteMemberTarget?.nama}"? Seluruh data profil anggota ini akan terhapus.`}
        isLoading={actionLoading}
      />
    </div>
  );
}
