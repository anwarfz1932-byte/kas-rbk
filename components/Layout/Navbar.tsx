'use client';

import React from 'react';
import { UserCheck, LogIn, LogOut, UserX, Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ViewTab } from './Sidebar';

interface NavbarProps {
  currentTab: ViewTab;
  onOpenMobileSidebar?: () => void;
  onOpenLoginModal?: () => void;
  onLogoutToast?: (msg: string) => void;
}

const tabTitles: Record<ViewTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard Kas Remaja',
    subtitle: 'Ringkasan posisi keuangan kas Remaja Blater Kidul',
  },
  transactions: {
    title: 'Pencatatan Transaksi Kas',
    subtitle: 'Catat pemasukan dan pengeluaran kas dengan akurat',
  },
  history: {
    title: 'Riwayat Transaksi',
    subtitle: 'Daftar transaksi kas lengkap dengan filter dan pencarian',
  },
  reports: {
    title: 'Laporan Keuangan Kas',
    subtitle: 'Unduh dan cetak laporan kas resmi format PDF & Excel',
  },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenMobileSidebar,
  onOpenLoginModal,
  onLogoutToast,
}) => {
  const { user, logout } = useAuth();

  const currentInfo = tabTitles[currentTab] || tabTitles.dashboard;

  const handleLogout = async () => {
    await logout();
    if (onLogoutToast) {
      onLogoutToast('Anda telah keluar dari akun Admin, kini dalam mode Tamu.');
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white shadow-md border-b border-red-700/80 px-4 sm:px-6 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left side: Mobile Menu Button + Title */}
        <div className="flex items-center gap-3">
          {onOpenMobileSidebar && (
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer active:scale-95 border border-white/20"
              title="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight tracking-tight">
                {currentInfo.title}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-white border border-white/20">
                <ShieldCheck className="w-3 h-3 text-red-200" />
                Merah Putih
              </span>
            </div>
            <p className="text-xs text-red-100/90 hidden sm:block mt-0.5">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right side: Admin Profile / Login Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Admin Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-white">
                <UserCheck className="w-4 h-4 text-red-200 shrink-0" />
                <span className="max-w-[110px] sm:max-w-[160px] truncate">
                  {user.name || user.email}
                </span>
                {user.isDemo && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400 text-amber-950 font-bold shadow-xs">
                    Demo
                  </span>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white text-red-700 hover:bg-red-50 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Keluar dari akun Admin"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Mode Tamu Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs font-medium text-white/90">
                <UserX className="w-3.5 h-3.5 text-red-200" />
                <span>Mode Tamu</span>
              </div>

              {/* Login Button in Top Right Corner */}
              {onOpenLoginModal && (
                <button
                  onClick={onOpenLoginModal}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 text-red-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                  title="Masuk sebagai Pengurus/Admin Kas"
                >
                  <LogIn className="w-4 h-4 text-red-600" />
                  <span>Login Admin</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
