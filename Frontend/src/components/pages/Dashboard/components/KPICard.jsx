import React from 'react';

export default function KPICard({ icon, label, value, unit, change, changeLabel, highlight, highlightColor }) {
  const isPositiveChange = change != null && change > 0;
  const isNegativeChange = change != null && change < 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-red-50' : 'bg-blue-50'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className={`text-2xl font-bold ${highlight ? 'text-gray-800' : 'text-gray-800'}`}>
            {value}
          </span>
          <span className="text-sm text-gray-500">{unit}</span>
        </div>
        {change != null && (
          <p className={`text-xs mt-0.5 ${isPositiveChange ? 'text-green-600' : isNegativeChange ? 'text-red-500' : 'text-gray-400'}`}>
            {isPositiveChange ? '▲' : isNegativeChange ? '▲' : ''} {Math.abs(change)}% {changeLabel}
          </p>
        )}
        {highlightColor && (
          <p className={`text-xs mt-0.5 font-semibold ${highlightColor}`}>
            Loss Rate {highlight}
          </p>
        )}
      </div>
    </div>
  );
}
