'use client';

import React from 'react';
import { Menu, Sun, Moon, LogOut, UserCheck, KeyRound } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ViewTab } from './Sidebar';

interface NavbarProps {
  currentTab: ViewTab;
  onOpenMobileSidebar: () => void;
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
  onOpenMobileSidebar,
  onOpenChangePassword,
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();

  const currentInfo = tabTitles[currentTab] || tabTitles.dashboard;

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left side: Hamburger + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-emerald-100 dark:border-slate-700 transition-colors"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
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
          {/* Dark Mode Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl border border-emerald-100 dark:border-slate-700 bg-emerald-50/50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors"
            title={isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Profile Tag */}
          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
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
              className="p-2.5 sm:px-3 sm:py-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Ganti Password Admin"
            >
              <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Ganti Password</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2.5 sm:px-3 sm:py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-medium text-xs flex items-center gap-1.5 transition-colors"
            title="Keluar / Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
