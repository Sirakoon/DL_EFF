import React from 'react';
import { HiCalendarDays } from 'react-icons/hi2';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Header({ title, subtitle }) {
  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2,'0')} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
      <div>
        <h1 className="text-base font-black text-gray-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5 font-medium">{subtitle}</p>}
      </div>

      <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl">
        <HiCalendarDays className="text-gray-400 text-sm" />
        {dateStr} · {timeStr}
      </div>
    </header>
  );
}
