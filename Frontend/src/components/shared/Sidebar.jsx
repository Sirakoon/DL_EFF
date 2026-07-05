import React from 'react';
import { NAV_SECTIONS } from '../../constants/navigation';
import {
  HiChartBarSquare, HiTableCells, HiChevronLeft, HiChevronRight,
} from 'react-icons/hi2';
import { MdOutlineSpeed } from 'react-icons/md';
import { TbActivityHeartbeat, TbDatabase } from 'react-icons/tb';
import { BiSolidFactory } from 'react-icons/bi';

const ICONS = {
  'activity': <TbActivityHeartbeat className="w-5 h-5" />,
  'database': <TbDatabase className="w-5 h-5" />,
  'bar-chart': <HiChartBarSquare className="w-5 h-5" />,
  'table': <HiTableCells className="w-5 h-5" />,
};

export default function Sidebar({ activeKey, onSelect, collapsed, onToggle }) {
  return (
    <aside className={`flex flex-col bg-white border-r border-gray-100 h-screen sticky top-0 transition-all duration-300 shadow-sm ${collapsed ? 'w-16' : 'w-60'}`}>

      {/* Logo */}
      <div className={`flex items-center gap-3 border-b border-gray-100 min-h-[64px] ${collapsed ? 'px-4 justify-center' : 'px-5'}`}>
        <div className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200">
          <BiSolidFactory className="text-xl" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-black text-gray-900 text-sm leading-none">Production</div>
            <div className="text-[11px] text-gray-400 font-medium mt-0.5">Management System</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-3 mb-2 mt-3">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const active = item.key === activeKey;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelect(item.key)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                >
                  <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-gray-400'}`}>
                    {ICONS[item.icon]}
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-50 text-xs transition"
      >
        {collapsed
          ? <HiChevronRight className="w-4 h-4" />
          : <><HiChevronLeft className="w-4 h-4" /><span>Collapse</span></>
        }
      </button>
    </aside>
  );
}
