'use client';

import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  History,
  FileSpreadsheet,
  X,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export type ViewTab = 'dashboard' | 'transactions' | 'history' | 'reports';

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
    { id: 'transactions', label: 'Transaksi Kas', icon: Wallet },
    { id: 'history', label: 'Riwayat Transaksi', icon: History },
    { id: 'reports', label: 'Laporan Keuangan', icon: FileSpreadsheet },
  ];

  const handleNavClick = (tab: ViewTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 p-4 text-slate-800 shadow-xs">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-5 pt-2 px-1 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-slate-900 leading-tight">
              Remaja Blater Kidul
            </h1>
            <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
              Kas Merah Putih
            </p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Tutup Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-1.5">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          NAVIGASI UTAMA
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-red-50 text-red-700 font-bold border-l-4 border-red-600 shadow-2xs'
                  : 'text-slate-600 hover:bg-red-50/50 hover:text-red-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-red-600' : 'text-red-500/70'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Organisasi Info */}
      <div className="pt-4 border-t border-slate-100 px-1 space-y-3">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
          <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-red-600 shrink-0" />
            Remaja Blater Kidul
          </p>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Sistem Pencatatan Uang Kas Berbasis Transparansi & Akuntabilitas
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
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
