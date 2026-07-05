import React from 'react';

function GaugeArc({ value, target, size = 110 }) {
  const R = 40;
  const cx = 55, cy = 55;
  const startAngle = -210;
  const sweepTotal = 240;

  function polar(deg, r) {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function arcPath(from, to, r) {
    const [x1, y1] = polar(from, r);
    const [x2, y2] = polar(to, r);
    const large = to - from > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  const maxVal = target !== null ? target * 2.5 : 20;
  const fillFrac = value !== null ? Math.min(Math.max(value / maxVal, 0), 1) : 0;
  const fillAngle = startAngle + sweepTotal * fillFrac;
  // target tick at 40% of the arc (target / maxVal)
  const targetFrac = target !== null ? Math.min(target / maxVal, 1) : 0.4;
  const tickAngle = startAngle + sweepTotal * targetFrac;

  const met = value !== null && target !== null && value >= target;
  const color = value === null ? '#d1d5db' : met ? '#16a34a' : '#dc2626';

  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 110 86">
      <path d={arcPath(startAngle, startAngle + sweepTotal, R)}
        fill="none" stroke="#e5e7eb" strokeWidth={9} strokeLinecap="round" />
      {value !== null && (
        <path d={arcPath(startAngle, fillAngle, R)}
          fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" />
      )}
      {target !== null && (() => {
        const [ix, iy] = polar(tickAngle, R - 6);
        const [ox, oy] = polar(tickAngle, R + 5);
        return <line x1={ix} y1={iy} x2={ox} y2={oy} stroke="#f59e0b" strokeWidth={2.5} strokeLinecap="round" />;
      })()}
    </svg>
  );
}

export default function DlEffGauge({ name, dlEff, target, shifts = [], onClick, selected, compact }) {
  const met = dlEff !== null && dlEff !== undefined && target !== null && dlEff >= target;
  const noData = dlEff === null || dlEff === undefined;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`w-full text-left rounded-lg border-2 px-3 py-2 transition-all hover:shadow-sm ${selected ? 'border-blue-500 bg-blue-50'
            : noData ? 'border-gray-200 bg-white'
              : met ? 'border-green-300 bg-green-50'
                : 'border-red-300 bg-red-50'
          }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-gray-700 truncate">{name}</span>
          <span className={`text-sm font-bold flex-shrink-0 ${noData ? 'text-gray-300' : met ? 'text-green-600' : 'text-red-600'}`}>
            {noData ? '—' : `${dlEff.toFixed(1)}%`}
          </span>
        </div>
        {/* Mini bar */}
        <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          {!noData && target && (
            <div
              className={`h-full rounded-full transition-all ${met ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min((dlEff / (target * 2.5)) * 100, 100)}%` }}
            />
          )}
        </div>
        {/* Shifts row */}
        {shifts.length > 0 && (
          <div className="flex gap-2 mt-1.5">
            {shifts.map((s) => {
              const sm = s.dlEff !== null && target !== null && s.dlEff >= target;
              return (
                <span key={s.shift} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${s.dlEff === null ? 'bg-gray-100 text-gray-400'
                    : sm ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                  {s.shift}: {s.dlEff === null ? '—' : `${s.dlEff.toFixed(1)}%`}
                </span>
              );
            })}
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border-2 p-3 transition-all hover:shadow-md ${selected ? 'border-blue-500 shadow-md bg-blue-50'
          : noData ? 'border-gray-200 bg-white'
            : met ? 'border-green-300 bg-white'
              : 'border-red-300 bg-white'
        }`}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className="font-semibold text-gray-800 text-sm truncate">{name}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${noData ? 'bg-gray-100 text-gray-400'
            : met ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
          {noData ? 'No data' : met ? '✓ On target' : '✗ Below'}
        </span>
      </div>

      <div className="flex justify-center">
        <div className="relative">
          <GaugeArc value={dlEff} target={target} size={120} />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
            <span className={`text-xl font-bold leading-none ${noData ? 'text-gray-300' : met ? 'text-green-600' : 'text-red-600'}`}>
              {noData ? '—' : `${dlEff.toFixed(1)}%`}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">Target {target ?? '—'}%</span>
          </div>
        </div>
      </div>

      {shifts.length > 0 && (
        <div className="space-y-1 mt-1">
          {shifts.map((s) => {
            const sm = s.dlEff !== null && target !== null && s.dlEff >= target;
            return (
              <div key={s.shift} className="flex items-center gap-1.5 text-xs">
                <span className="text-gray-400 w-12 flex-shrink-0">Shift {s.shift}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  {s.dlEff !== null && target && (
                    <div
                      className={`h-full rounded-full ${sm ? 'bg-green-400' : 'bg-red-400'}`}
                      style={{ width: `${Math.min((s.dlEff / (target * 2.5)) * 100, 100)}%` }}
                    />
                  )}
                </div>
                <span className={`w-12 text-right font-medium flex-shrink-0 ${s.dlEff === null ? 'text-gray-300' : sm ? 'text-green-600' : 'text-red-600'}`}>
                  {s.dlEff === null ? '—' : `${s.dlEff.toFixed(1)}%`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </button>
  );
}
