import React from 'react';
import { todayStr } from '../../../../utils/date';

function FilterSelect({ label, icon, value, onChange, options, allLabel = 'All' }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-[170px]">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 leading-none">{label}</p>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none w-full mt-0.5 cursor-pointer"
        >
          <option value="">{allLabel}</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

const CalIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const McIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
  </svg>
);
const ShiftIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const BoxIcon = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
  </svg>
);

export default function FilterBar({ filters, onChange, options }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Date range */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
        <span className="text-gray-400">{CalIcon}</span>
        <div>
          <p className="text-[10px] text-gray-400 leading-none">Date Range</p>
          <div className="flex items-center gap-1 mt-0.5">
            <input
              type="date"
              value={filters.dateFrom || ''}
              max={filters.dateTo || todayStr()}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
              className="text-xs text-gray-700 bg-transparent border-none outline-none cursor-pointer"
            />
            <span className="text-gray-400 text-xs">-</span>
            <input
              type="date"
              value={filters.dateTo || ''}
              min={filters.dateFrom || undefined}
              max={todayStr()}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
              className="text-xs text-gray-700 bg-transparent border-none outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <FilterSelect
        label="Machine"
        icon={McIcon}
        value={filters.machine || ''}
        onChange={(v) => onChange({ ...filters, machine: v })}
        options={options.machines || []}
      />
      <FilterSelect
        label="Shift"
        icon={ShiftIcon}
        value={filters.shift || ''}
        onChange={(v) => onChange({ ...filters, shift: v })}
        options={options.shifts || []}
      />
      <FilterSelect
        label="Product Group"
        icon={BoxIcon}
        value={filters.productGroup || ''}
        onChange={(v) => onChange({ ...filters, productGroup: v })}
        options={options.productGroups || []}
      />

      {/* Reset */}
      <button
        onClick={() => onChange({})}
        className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 px-3 py-2 bg-white border border-gray-200 rounded-lg"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Reset Filters
      </button>
    </div>
  );
}
