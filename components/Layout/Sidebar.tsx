'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Wallet,
  History,
  FileSpreadsheet,
  X,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export type ViewTab = 'dashboard' | 'members' | 'transactions' | 'history' | 'reports';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const menuItems: { id: ViewTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Data Anggota', icon: Users },
    { id: 'transactions', label: 'Transaksi Kas', icon: Wallet },
    { id: 'history', label: 'Riwayat Transaksi', icon: History },
    { id: 'reports', label: 'Laporan Keuangan', icon: FileSpreadsheet },
  ];

  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleNavClick = (tab: ViewTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-red-100 dark:border-slate-800 w-64 p-4 text-slate-800 dark:text-slate-100">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-6 pt-2 px-2 border-b border-gray-200 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-red-950 dark:text-red-400 leading-tight">
              Kas Remaja
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              Pengelola Uang Kas
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1">
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
          Menu Utama
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 font-semibold border border-red-100 dark:border-red-900/40'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Info & Theme Switcher */}
      <div className="pt-4 border-t border-red-100 dark:border-slate-800 px-3 space-y-3">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors cursor-pointer text-xs font-semibold"
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? (
              <Moon className="w-4 h-4 text-red-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span>{isDarkMode ? 'Mode Gelap Active' : 'Mode Terang Active'}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold border border-red-200 dark:border-red-800">
            {isDarkMode ? 'Dark' : 'Light'}
          </span>
        </button>

        <div className="p-3 bg-red-50/80 dark:bg-slate-800/60 rounded-xl border border-red-100 dark:border-slate-700/60">
          <p className="text-xs font-semibold text-red-900 dark:text-red-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-400" />
            Organisasi Remaja
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Sistem Pencatatan Kas Merah Putih
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-50 flex-1 max-w-xs w-full animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
