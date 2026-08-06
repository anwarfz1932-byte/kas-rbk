'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', id }) => {
  return (
    <div
      id={id}
      className={`bg-white border border-slate-200/80 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
};
