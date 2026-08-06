'use client';

import React from 'react';
import {
  LayoutDashboard,
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
    { id: 'transactions', label: 'Kas', icon: Wallet },
    { id: 'history', label: 'Riwayat', icon: History },
    { id: 'reports', label: 'Laporan', icon: FileSpreadsheet },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-red-600 shadow-2xl px-2 py-2 transition-colors">
      <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 sm:px-5 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/25 scale-105 border border-red-700'
                  : 'text-slate-600 hover:text-red-600 hover:bg-red-50 font-semibold'
              }`}
              title={item.label}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white stroke-[2.5px]' : 'text-slate-500 hover:text-red-600 stroke-[1.75px]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </div>
              <span className={`text-[11px] sm:text-xs mt-1 ${isActive ? 'text-white font-bold' : 'text-slate-600 font-bold'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
