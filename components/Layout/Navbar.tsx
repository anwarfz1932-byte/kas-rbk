'use client';

import React from 'react';
import { Sun, UserCheck, KeyRound } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ViewTab } from './Sidebar';

interface NavbarProps {
  currentTab: ViewTab;
  onOpenMobileSidebar?: () => void;
  onOpenChangePassword?: () => void;
}

const tabTitles: Record<ViewTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard Kas',
    subtitle: 'Ringkasan posisi keuangan kas remaja secara realtime',
  },
  members: {
    title: 'Data Anggota Remaja',
    subtitle: 'Kelola daftar anggota dan peranan pengurus',
  },
  transactions: {
    title: 'Pencatatan Transaksi',
    subtitle: 'Catat uang masuk dan keluar dengan akurat',
  },
  history: {
    title: 'Riwayat Transaksi',
    subtitle: 'Daftar transaksi kas lengkap dengan filter dan pencarian',
  },
  reports: {
    title: 'Laporan Keuangan',
    subtitle: 'Unduh dan cetak laporan resmi format PDF & Excel',
  },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenChangePassword,
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();

  const currentInfo = tabTitles[currentTab] || tabTitles.dashboard;

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left side: App Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {currentInfo.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {currentInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right side: Dark Mode + Admin Profile + Change Password + Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Indicator (Terang Putih) */}
          <div
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-red-100 bg-red-50/60 text-slate-700 font-medium text-xs flex items-center gap-2"
            title="Tema Terang Aktif"
          >
            <Sun className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="hidden sm:inline font-semibold text-slate-700">Tema Terang</span>
          </div>

          {/* User Profile Tag */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-slate-800 border border-red-200 dark:border-slate-700 text-xs font-semibold text-red-800 dark:text-red-300">
              <UserCheck className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span className="max-w-[120px] sm:max-w-[180px] truncate">
                {user.name || user.email}
              </span>
              {user.isDemo && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Demo
                </span>
              )}
            </div>
          )}

          {/* Change Password Button */}
          {onOpenChangePassword && (
            <button
              onClick={onOpenChangePassword}
              className="p-2.5 sm:px-3 sm:py-2 rounded-xl border border-red-200 dark:border-red-800/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ganti Password Admin"
            >
              <KeyRound className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="hidden md:inline">Ganti Password</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
