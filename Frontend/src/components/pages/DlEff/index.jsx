import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  HiCalendar, HiCalendarDays, HiChartBar, HiMagnifyingGlass,
  HiCheckCircle, HiXCircle, HiXMark, HiExclamationTriangle,
  HiArrowTrendingUp, HiArrowTrendingDown, HiFunnel,
} from 'react-icons/hi2';
import { MdToday, MdDateRange } from 'react-icons/md';
import { BiSolidFactory } from 'react-icons/bi';
import DlEffDetailTable from './components/DlEffDetailTable';
import { getDlEffOverview, getDlEffDetail } from '../../../services/api';
import { toast } from '../../../lib/toast';

/* ─── constants ──────────────────────────────────────────────────── */
const PERIODS = [
  { key: 'daily', label: 'Daily', Icon: MdToday },
  { key: 'weekly', label: 'Weekly', Icon: HiCalendar },
  { key: 'monthly', label: 'Monthly', Icon: MdDateRange },
  { key: 'yearly', label: 'Yearly', Icon: HiChartBar },
];

const MAIN_GROUP_ORDER = ['Gown', 'Drape', 'CWC'];
const DEFAULT_TARGETS = { Gown: 3.1, Drape: 3.1, CWC: 6.0 };

const THEME = {
  Gown: { grad: 'from-blue-600 to-blue-500', light: 'bg-blue-50', border: 'border-blue-100', accent: '#3b82f6', ring: 'ring-blue-200' },
  Drape: { grad: 'from-teal-600 to-teal-500', light: 'bg-teal-50', border: 'border-teal-100', accent: '#14b8a6', ring: 'ring-teal-200' },
  CWC: { grad: 'from-emerald-700 to-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-100', accent: '#10b981', ring: 'ring-emerald-200' },
};

/* ─── helpers ────────────────────────────────────────────────────── */
const today = () => new Date().toISOString().slice(0, 10);

const PERIOD_DAYS = { daily: 1, weekly: 7, monthly: 30, yearly: 365 };
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDate = (iso) => { if (!iso) return '—'; const [y,m,d] = iso.slice(0,10).split('-'); return `${d} ${MONTHS[+m-1]} ${y}`; };

/* ─── MiniBar ────────────────────────────────────────────────────── */
function MiniBar({ value, target, color }) {
  const pct = value != null && target ? Math.min(Math.max((value / (target * 2)) * 100, 0), 100) : 0;
  return (
    <div className="relative h-1.5 bg-black/10 rounded-full overflow-visible mt-1.5">
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="absolute top-[-3px] bottom-[-3px] w-[2px] bg-amber-400 rounded-full" style={{ left: '50%' }} />
    </div>
  );
}

/* ─── SemiGauge ──────────────────────────────────────────────────── */
function SemiGauge({ value, target, met, noData, groupAccent = '#3b82f6' }) {
  const W = 180, H = 110, CX = 90, CY = 96, R = 72, TRACK = 13;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const pt = (deg, r) => [
    CX + r * Math.cos(toRad(180 - deg)),
    CY - r * Math.sin(toRad(180 - deg)),
  ];

  const arcD = (fromDeg, toDeg, r) => {
    if (Math.abs(toDeg - fromDeg) < 0.01) return '';
    const [x1, y1] = pt(fromDeg, r);
    const [x2, y2] = pt(Math.min(toDeg, 179.99), r);
    const large = toDeg - fromDeg > 180 ? 1 : 0;
    return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`;
  };

  const minVal = 0;
  const maxVal = target != null ? Math.max(target * 2.5, 20) : 20;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const valueDeg = value != null ? clamp(((value - minVal) / (maxVal - minVal)) * 180, 1, 179) : 0;
  const targetDeg = target != null ? clamp(((target - minVal) / (maxVal - minVal)) * 180, 1, 179) : 72;

  const greenFrom = '#4ade80', greenTo = '#16a34a';
  const redFrom = '#fca5a5', redTo = '#dc2626';
  const fillId = `gauge-fill-${Math.round(value ?? 0)}`;
  const glowId = `gauge-glow-${Math.round(value ?? 0)}`;

  // tick marks at 0 / 45 / 90 / 135 / 180°
  const ticks = [0, 45, 90, 135, 180];

  // needle as a polygon (triangle tip)
  const needleTip = pt(valueDeg, R - TRACK / 2 - 4);
  const needleL = pt(valueDeg - 90, 4.5);
  const needleR2 = pt(valueDeg + 90, 4.5);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 96 }}>
      <defs>
        {/* gradient fill */}
        <linearGradient id={fillId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={met ? greenFrom : redFrom} />
          <stop offset="100%" stopColor={met ? greenTo : redTo} />
        </linearGradient>
        {/* glow filter */}
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ── outer subtle shadow ring ── */}
      <path d={arcD(0, 180, R + 2)} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={TRACK + 6} strokeLinecap="butt" />

      {/* ── track (background arc) ── */}
      <path d={arcD(0, 180, R)} fill="none" stroke="#f1f5f9" strokeWidth={TRACK} strokeLinecap="butt" />

      {/* ── dim zone beyond target ── */}
      {target != null && (
        <path d={arcD(targetDeg, 180, R)} fill="none" stroke="#fee2e2" strokeWidth={TRACK} strokeLinecap="butt" opacity="0.5" />
      )}

      {/* ── filled arc ── */}
      {!noData && valueDeg > 1 && (
        <path
          d={arcD(0, valueDeg, R)}
          fill="none"
          stroke={`url(#${fillId})`}
          strokeWidth={TRACK}
          strokeLinecap="butt"
          filter={`url(#${glowId})`}
        />
      )}

      {/* ── tick marks ── */}
      {ticks.map((deg) => {
        const [ix, iy] = pt(deg, R - TRACK / 2 - 3);
        const [ox, oy] = pt(deg, R + TRACK / 2 + 3);
        return <line key={deg} x1={ix} y1={iy} x2={ox} y2={oy} stroke="#cbd5e1" strokeWidth={1.5} strokeLinecap="round" />;
      })}

      {/* ── target tick (amber, prominent) ── */}
      {target != null && (() => {
        const [ix, iy] = pt(targetDeg, R - TRACK / 2 - 5);
        const [ox, oy] = pt(targetDeg, R + TRACK / 2 + 5);
        return (
          <g>
            <line x1={ix} y1={iy} x2={ox} y2={oy} stroke="#fbbf24" strokeWidth={3} strokeLinecap="round" />
            {/* amber dot */}
            <circle cx={(ix + ox) / 2 + (ox - ix) * 0.55} cy={(iy + oy) / 2 + (oy - iy) * 0.55}
              r="3.5" fill="#f59e0b" />
          </g>
        );
      })()}

      {/* ── needle ── */}
      {!noData && (
        <g>
          {/* shadow under needle */}
          <polygon
            points={`${needleTip[0]},${needleTip[1]} ${needleL[0]},${needleL[1]} ${needleR2[0]},${needleR2[1]}`}
            fill="rgba(0,0,0,0.15)"
            transform="translate(1,2)"
          />
          <polygon
            points={`${needleTip[0]},${needleTip[1]} ${needleL[0]},${needleL[1]} ${needleR2[0]},${needleR2[1]}`}
            fill={met ? '#15803d' : '#b91c1c'}
          />
          {/* pivot outer */}
          <circle cx={CX} cy={CY} r={7} fill={met ? '#15803d' : '#b91c1c'} />
          {/* pivot inner white */}
          <circle cx={CX} cy={CY} r={4.5} fill="white" />
          {/* pivot dot */}
          <circle cx={CX} cy={CY} r={2} fill={met ? '#16a34a' : '#dc2626'} />
        </g>
      )}

      {/* ── corner labels ── */}
      <text x={6} y={H - 4} fontSize="8.5" fill="#94a3b8" textAnchor="start" fontWeight="600">{minVal.toFixed(0)}</text>
      <text x={W - 6} y={H - 4} fontSize="8.5" fill="#94a3b8" textAnchor="end" fontWeight="600">{maxVal % 1 === 0 ? maxVal : maxVal.toFixed(1)}</text>

      {/* ── target label above tick ── */}
      {target != null && (() => {
        const [lx, ly] = pt(targetDeg, R + TRACK / 2 + 13);
        return (
          <text x={lx} y={ly} fontSize="8" fill="#f59e0b" textAnchor="middle" fontWeight="800">
            {target}
          </text>
        );
      })()}
    </svg>
  );
}

/* ─── SubGroupCard ───────────────────────────────────────────────── */
function SubGroupCard({ sg, mainTarget, showShifts, selected, onClick }) {
  const target = sg.target ?? mainTarget;
  const met = sg.dlEff != null && target != null && sg.dlEff >= target;
  const noData = sg.dlEff == null;

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-2xl p-4 border-2 transition-all duration-200 ${selected
          ? 'border-blue-500 bg-white shadow-lg ring-4 ring-blue-100 scale-[1.02]'
          : noData
            ? 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            : met
              ? 'border-green-200 bg-white hover:border-green-400 hover:shadow-md'
              : 'border-red-200 bg-white hover:border-red-400 hover:shadow-md'
        }`}
    >
      {/* name + dot */}
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide leading-tight">{sg.subGroup}</span>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${noData ? 'bg-gray-300' : met ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      {/* big number */}
      <div className={`text-[28px] font-black leading-none tracking-tight ${noData ? 'text-gray-200' : met ? 'text-green-600' : 'text-red-600'}`}>
        {noData ? '—' : `${sg.dlEff.toFixed(1)}`}
        {!noData && <span className="text-base font-semibold ml-0.5">%</span>}
      </div>

      {/* bar */}
      {!noData && target && <MiniBar value={sg.dlEff} target={target} color={met ? '#16a34a' : '#dc2626'} />}

      {/* target */}
      <div className="text-[10px] text-gray-400 mt-2 font-medium">Target {target ?? '—'}%</div>

      {/* shift chips */}
      {showShifts && sg.shifts.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5 pt-2.5 border-t border-gray-100">
          {sg.shifts.map((s) => {
            const sm = s.dlEff != null && target != null && s.dlEff >= target;
            return (
              <span key={s.shift} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${s.dlEff == null ? 'bg-gray-100 text-gray-400'
                  : sm ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {s.shift} {s.dlEff == null ? '—' : `${s.dlEff.toFixed(1)}%`}
              </span>
            );
          })}
        </div>
      )}
    </button>
  );
}

/* ─── MainGroupSection ───────────────────────────────────────────── */
function MainGroupSection({ mg, showShifts, selected, onSelectSub }) {
  const theme = THEME[mg.group] ?? THEME.Gown;
  const met = mg.meetsTarget === true;
  const noData = mg.meetsTarget === null;

  return (
    <div className={`rounded-3xl overflow-hidden shadow-sm border ${theme.border}`}>
      {/* header */}
      <div className={`bg-gradient-to-r ${theme.grad} px-6 py-5 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <BiSolidFactory className="text-white text-xl" />
          </div>
          <div>
            <div className="text-white font-extrabold text-xl tracking-tight">{mg.group} Products</div>
            <div className="text-white/60 text-xs mt-0.5 font-medium">
              {mg.subGroups.length} product group{mg.subGroups.length !== 1 ? 's' : ''} · Target {mg.target ?? '—'}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {mg.dlEff != null && (
            <div className="text-right">
              <div className="text-white font-black text-3xl leading-none">{mg.dlEff.toFixed(1)}%</div>
              <div className="text-white/50 text-[10px] mt-0.5 font-medium uppercase tracking-wider">Overall</div>
            </div>
          )}
          <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${noData ? 'bg-white/20 text-white'
              : met ? 'bg-white text-green-700' : 'bg-white text-red-600'
            }`}>
            {noData ? null : met
              ? <HiCheckCircle className="text-green-500 text-sm" />
              : <HiXCircle className="text-red-500 text-sm" />
            }
            {noData ? 'No Data' : met ? 'On Target' : 'Below Target'}
          </div>
        </div>
      </div>

      {/* sub-group grid */}
      <div className={`${theme.light} p-5`}>
        {mg.subGroups.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No data in selected range</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {mg.subGroups.map((sg) => (
              <SubGroupCard
                key={sg.subGroup}
                sg={sg}
                mainTarget={mg.target}
                showShifts={showShifts}
                selected={selected?.subGroup === sg.subGroup}
                onClick={() => onSelectSub(mg.group, sg.subGroup)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── main page ──────────────────────────────────────────────────── */
export default function DlEffDashboard() {
  const [period, setPeriod] = useState('daily');
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today());
  const [shift, setShift] = useState('');

  const [overview, setOverview] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef(null);

  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState({ data: [], topReasons: [] });
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    setDateFrom(daysAgo(PERIOD_DAYS[period]));
    setDateTo(today());
    setShift('');
    setSelected(null);
  }, [period]);

  const defaultFrom = daysAgo(PERIOD_DAYS[period]);
  const isFiltered = dateFrom !== defaultFrom || dateTo !== today() || !!shift;

  const handleClear = () => {
    setDateFrom(daysAgo(PERIOD_DAYS[period]));
    setDateTo(today());
    setShift('');
    setSelected(null);
  };

  const buildParams = useCallback(() => ({
    dateFrom,
    dateTo,
    ...(shift && { shift }),
  }), [dateFrom, dateTo, shift]);

  const fetchOverview = useCallback(() => {
    setLoadingOverview(true);
    setError(null);
    getDlEffOverview(buildParams())
      .then((res) => { setOverview(res.data ?? []); setLastUpdated(new Date()); })
      .catch((e) => { setError(e.message); toast.error(`DL Eff load failed: ${e.message}`); })
      .finally(() => setLoadingOverview(false));
  }, [buildParams]);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  useEffect(() => {
    if (!autoRefresh) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(fetchOverview, 30_000);
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, fetchOverview]);

  useEffect(() => {
    if (!selected) return;
    setLoadingDetail(true);
    getDlEffDetail({ ...buildParams(), productGroup: selected.subGroup })
      .then(setDetail)
      .catch(() => setDetail({ data: [], topReasons: [] }))
      .finally(() => setLoadingDetail(false));
  }, [selected, buildParams]);

  const mainGroups = MAIN_GROUP_ORDER.map((name) =>
    overview.find((g) => g.group === name)
    ?? { group: name, target: DEFAULT_TARGETS[name], dlEff: null, meetsTarget: null, subGroups: [] }
  );

  const metCount = mainGroups.filter((g) => g.meetsTarget === true).length;
  const missCount = mainGroups.filter((g) => g.meetsTarget === false).length;

  const handleSelectSub = (mainGroup, subGroup) =>
    setSelected((prev) => prev?.subGroup === subGroup ? null : { mainGroup, subGroup });

  return (
    <div className="space-y-6 pb-12">

      {/* ── Filter card ─────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Period tabs */}
        <div className="grid grid-cols-4 border-b border-gray-100">
          {PERIODS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all border-b-2 ${period === key
                  ? 'border-blue-600 text-blue-600 bg-blue-50/60'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Icon className={`text-lg ${period === key ? 'text-blue-600' : 'text-gray-400'}`} />
              {label}
            </button>
          ))}
        </div>

        {/* Filter inputs */}
        <div className="flex flex-wrap items-end gap-5 px-6 py-5">

          {/* Date range — always shown */}
          <div className="flex items-end gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Date From</label>
              <input
                type="date" value={dateFrom} max={dateTo}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </div>
            <span className="text-gray-300 font-bold mb-2.5">→</span>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Date To</label>
              <input
                type="date" value={dateTo} min={dateFrom} max={today()}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </div>
          </div>

          {/* Shift buttons */}
          {true && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Shift</label>
              <div className="flex gap-1.5">
                {[{ v: '', l: 'All' }, { v: 'A', l: 'A' }, { v: 'B', l: 'B' }, { v: 'C', l: 'C' }].map(({ v, l }) => (
                  <button
                    key={v}
                    onClick={() => setShift(v)}
                    className={`h-10 px-4 rounded-xl text-sm font-bold border-2 transition-all ${shift === v
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                      }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Apply */}
          <button
            onClick={fetchOverview}
            disabled={loadingOverview}
            className="h-10 flex items-center gap-2 px-5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-60 transition-all shadow-md shadow-blue-200"
          >
            {loadingOverview
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <HiMagnifyingGlass className="text-base" />
            }
            Apply
          </button>

          {/* Clear Filter */}
          <button
            onClick={handleClear}
            disabled={!isFiltered}
            className={`h-10 flex items-center gap-2 px-4 text-sm font-bold rounded-xl border-2 transition-all ${
              isFiltered
                ? 'border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50'
                : 'border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            <HiFunnel className="text-base" />
            Clear
          </button>

          {/* auto-refresh toggle + last updated */}
          <div className="flex items-center gap-2 ml-auto">
            {lastUpdated && (
              <span className="text-[10px] text-gray-300">
                Updated {lastUpdated.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <button onClick={() => setAutoRefresh((v) => !v)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {autoRefresh ? '⟳ Auto' : 'Auto off'}
            </button>
          </div>

          {/* summary pills */}
          {!loadingOverview && (metCount > 0 || missCount > 0) && (
            <div className="flex gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold px-3 py-2 rounded-full">
                <HiArrowTrendingUp className="text-green-500" />
                {metCount} group{metCount !== 1 ? 's' : ''} on target
              </span>
              <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-3 py-2 rounded-full">
                <HiArrowTrendingDown className="text-red-500" />
                {missCount} group{missCount !== 1 ? 's' : ''} below target
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          <HiExclamationTriangle className="text-red-500 text-xl flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Overview ───────────────────────────────────────────────── */}
      {loadingOverview ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-gray-400 text-sm font-medium">Loading data...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {mainGroups.map((mg) => (
            <MainGroupSection
              key={mg.group}
              mg={mg}
              showShifts={!shift}
              selected={selected}
              onSelectSub={handleSelectSub}
            />
          ))}
        </div>
      )}

      {/* ── Detail panel ───────────────────────────────────────────── */}
      {selected && (
        <div className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {/* panel header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center gap-3 flex-wrap">
              <HiCalendarDays className="text-gray-400 text-xl" />
              <span className="font-black text-gray-800 text-base">Detail</span>
              <span
                className="font-bold text-sm text-white px-3 py-1 rounded-full shadow-sm"
                style={{ background: THEME[selected.mainGroup]?.accent ?? '#3b82f6' }}
              >
                {selected.subGroup}
              </span>
              <span className="text-gray-400 text-sm">{selected.mainGroup}</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500 text-sm">
                {fmtDate(dateFrom)}{period !== 'daily' ? ` – ${fmtDate(dateTo)}` : ''}
              </span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors px-3 py-2 rounded-xl hover:bg-gray-100"
            >
              <HiXMark className="text-base" />
              Close
            </button>
          </div>

          <div className="bg-white p-6">
            <DlEffDetailTable
              data={detail.data}
              loading={loadingDetail}
              target={mainGroups.find((g) => g.group === selected.mainGroup)?.target ?? null}
            />
          </div>
        </div>
      )}
    </div>
  );
}
