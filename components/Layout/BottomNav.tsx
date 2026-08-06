'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Wallet,
  History,
  FileSpreadsheet,
} from 'lucide-react';
import { ViewTab } from './Sidebar';

interface BottomNavProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const navItems: { id: ViewTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Anggota', icon: Users },
    { id: 'transactions', label: 'Kas', icon: Wallet },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'reports', label: 'Laporan', icon: FileSpreadsheet },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 py-1.5 transition-colors">
      <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2.5 sm:px-4 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-red-600 dark:text-red-400 bg-red-50/90 dark:bg-red-950/60 font-bold scale-105 border border-red-100 dark:border-red-900/40'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
              }`}
              title={item.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] sm:text-xs mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
