import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  HiCalendar, HiCalendarDays, HiChartBar,
  HiCheckCircle, HiXCircle, HiXMark, HiExclamationTriangle, HiFunnel,
} from 'react-icons/hi2';
import { TbLoader2 } from 'react-icons/tb';
import { MdToday, MdDateRange } from 'react-icons/md';
import { BiSolidFactory } from 'react-icons/bi';
import DlEffDetailTable from './components/DlEffDetailTable';
import { getDlEffOverview, getDlEffDetail } from '../../../services/api';
import { toast } from '../../../lib/toast';
import { useAutoRefresh } from '../../../hooks/useAutoRefresh';
import { todayStr as today, daysAgoStr as daysAgo } from '../../../utils/date';

const PERIODS = [
  { key: 'daily', label: 'Daily', Icon: MdToday },
  { key: 'weekly', label: 'Weekly', Icon: HiCalendar },
  { key: 'monthly', label: 'Monthly', Icon: MdDateRange },
  { key: 'yearly', label: 'Yearly', Icon: HiChartBar },
];
const PERIOD_DAYS = { daily: 1, weekly: 7, monthly: 30, yearly: 365 };

const MAIN_GROUP_ORDER = ['Gown', 'Drape', 'CWC'];
const DEFAULT_TARGETS = { Gown: 3.1, Drape: 3.1, CWC: 6.0 };

const THEME = {
  Gown: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', bar: 'bg-blue-500', dot: '#3b82f6' },
  Drape: { text: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100', bar: 'bg-teal-500', dot: '#14b8a6' },
  CWC: { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', bar: 'bg-emerald-500', dot: '#10b981' },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (iso) => { if (!iso) return '—'; const [y, m, d] = iso.slice(0, 10).split('-'); return `${d} ${MONTHS[+m - 1]} ${y}`; };

function MiniBar({ value, target, color }) {
  const pct = value != null && target ? Math.min(Math.max((value / (target * 2)) * 100, 0), 100) : 0;
  return (
    <div className="relative h-1.5 bg-gray-100 rounded-full mt-2">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      <div className="absolute top-[-2px] bottom-[-2px] w-[2px] bg-amber-400 rounded-full" style={{ left: '50%' }} />
    </div>
  );
}

// Half-circle gauge — plain SVG arc (no chart library), same 0..target*2 scale as MiniBar.
function HalfGauge({ value, target, met, noData }) {
  const W = 108, H = 58, CX = W / 2, CY = H - 4, R = 42, TRACK = 9;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const pt = (deg, r) => [CX - r * Math.cos(toRad(deg)), CY - r * Math.sin(toRad(deg))];
  const arcD = (fromDeg, toDeg, r) => {
    if (toDeg - fromDeg < 0.5) return '';
    const [x1, y1] = pt(fromDeg, r);
    const [x2, y2] = pt(Math.min(toDeg, 179.99), r);
    return `M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`;
  };

  const scale = target ? target * 2 : 10;
  const filled = noData ? 0 : Math.min(Math.max(value, 0), scale);
  const filledDeg = (filled / scale) * 180;
  const color = noData ? '#d1d5db' : met ? '#16a34a' : '#dc2626';

  return (
    <div className="relative flex-shrink-0" style={{ width: W, height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <path d={arcD(0, 180, R)} fill="none" stroke="#f1f5f9" strokeWidth={TRACK} strokeLinecap="round" />
        {filledDeg > 0 && <path d={arcD(0, filledDeg, R)} fill="none" stroke={color} strokeWidth={TRACK} strokeLinecap="round" />}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pointer-events-none pb-0.5">
        <span className={`text-lg font-black leading-none ${noData ? 'text-gray-300' : met ? 'text-green-600' : 'text-red-600'}`}>
          {noData ? '—' : `${value.toFixed(1)}%`}
        </span>
      </div>
    </div>
  );
}

function SubGroupCard({ sg, mainTarget, showShifts, selected, onClick }) {
  const target = sg.target ?? mainTarget;
  const met = sg.dlEff != null && target != null && sg.dlEff >= target;
  const noData = sg.dlEff == null;

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left rounded-2xl p-4 border-2 transition-all duration-200 bg-white ${
        selected ? 'border-blue-500 shadow-lg ring-4 ring-blue-100' : 'border-gray-100 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide leading-tight">{sg.subGroup}</span>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${noData ? 'bg-gray-300' : met ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      <div className={`text-[26px] font-black leading-none tracking-tight ${noData ? 'text-gray-200' : met ? 'text-green-600' : 'text-red-600'}`}>
        {noData ? '—' : sg.dlEff.toFixed(1)}
        {!noData && <span className="text-sm font-semibold ml-0.5">%</span>}
      </div>

      {!noData && target && <MiniBar value={sg.dlEff} target={target} color={met ? 'bg-green-500' : 'bg-red-500'} />}

      <div className="text-[10px] text-gray-400 mt-2 font-medium">Target {target ?? '—'}%</div>

      {showShifts && sg.shifts.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5 pt-2.5 border-t border-gray-100">
          {sg.shifts.map((s) => {
            const sm = s.dlEff != null && target != null && s.dlEff >= target;
            return (
              <span key={s.shift} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                s.dlEff == null ? 'bg-gray-100 text-gray-400' : sm ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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

function MainGroupSection({ mg, showShifts, selected, onSelectSub }) {
  const theme = THEME[mg.group] ?? THEME.Gown;
  const met = mg.meetsTarget === true;
  const noData = mg.meetsTarget === null;

  return (
    <div className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme.bg}`}>
            <BiSolidFactory className={`text-lg ${theme.text}`} />
          </div>
          <div>
            <div className="font-black text-gray-900 text-base leading-none">{mg.group}</div>
            <div className="text-gray-400 text-xs mt-1 font-medium">
              {mg.subGroups.length} product group{mg.subGroups.length !== 1 ? 's' : ''} · Target {mg.target ?? '—'}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <HalfGauge value={mg.dlEff} target={mg.target} met={met} noData={noData} />
          <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
            noData ? 'bg-gray-100 text-gray-500' : met ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            {noData ? null : met ? <HiCheckCircle className="text-sm" /> : <HiXCircle className="text-sm" />}
            {noData ? 'No Data' : met ? 'On Target' : 'Below Target'}
          </div>
        </div>
      </div>

      <div className="p-5">
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

export default function DlEffDashboard() {
  const [period, setPeriod] = useState('daily');
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today());
  const [shift, setShift] = useState('');

  const [overview, setOverview] = useState([]);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  // First load blanks the page with the big spinner; every fetch after that
  // (filter changes, period switches, auto-refresh) is a smooth background
  // refetch that keeps the existing cards on screen instead of flashing.
  const hasLoadedOnce = useRef(false);

  const fetchOverview = useCallback((background = false) => {
    background ? setRefreshing(true) : setLoadingOverview(true);
    if (!background) setError(null);
    getDlEffOverview(buildParams())
      .then((res) => { setOverview(res.data ?? []); setLastUpdated(new Date()); })
      .catch((e) => { if (!background) { setError(e.message); toast.error(`DL Eff load failed: ${e.message}`); } })
      .finally(() => {
        background ? setRefreshing(false) : setLoadingOverview(false);
        hasLoadedOnce.current = true;
      });
  }, [buildParams]);

  useEffect(() => { fetchOverview(hasLoadedOnce.current); }, [fetchOverview]);

  useAutoRefresh(() => fetchOverview(true), { enabled: autoRefresh });

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

  const handleSelectSub = (mainGroup, subGroup) =>
    setSelected((prev) => prev?.subGroup === subGroup ? null : { mainGroup, subGroup });

  return (
    <div className="space-y-5 pb-12">

      {/* ── Filters ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-4 border-b border-gray-100">
          {PERIODS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all border-b-2 ${
                period === key ? 'border-blue-600 text-blue-600 bg-blue-50/60' : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className={`text-lg ${period === key ? 'text-blue-600' : 'text-gray-400'}`} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-4 px-6 py-4">
          <div className="flex items-end gap-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Date From</label>
              <input
                type="date" value={dateFrom} max={dateTo}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </div>
            <span className="text-gray-300 font-bold mb-2.5">→</span>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Date To</label>
              <input
                type="date" value={dateTo} min={dateFrom} max={today()}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Shift</label>
            <div className="flex gap-1.5">
              {[{ v: '', l: 'All' }, { v: 'A', l: 'A' }, { v: 'B', l: 'B' }, { v: 'C', l: 'C' }].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setShift(v)}
                  className={`h-10 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
                    shift === v ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleClear}
            disabled={!isFiltered}
            className={`h-10 flex items-center gap-2 px-4 text-sm font-bold rounded-xl border-2 transition-all ${
              isFiltered ? 'border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50' : 'border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            <HiFunnel className="text-base" />
            Clear
          </button>

          <div className="flex items-center gap-2 ml-auto">
            {refreshing && <TbLoader2 className="animate-spin text-gray-300" />}
            {lastUpdated && (
              <span className="text-[10px] text-gray-300">
                Updated {lastUpdated.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Bangkok' })}
              </span>
            )}
            <button onClick={() => setAutoRefresh((v) => !v)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {autoRefresh ? '⟳ Auto' : 'Auto off'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
          <HiExclamationTriangle className="text-red-500 text-xl flex-shrink-0" />
          {error}
        </div>
      )}

      {/* ── Overview ─────────────────────────────────────────────── */}
      {loadingOverview ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-gray-400 text-sm font-medium">Loading data...</span>
        </div>
      ) : (
        <div className={`space-y-4 transition-opacity duration-200 ${refreshing ? 'opacity-60' : 'opacity-100'}`}>
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

      {/* ── Detail panel ─────────────────────────────────────────── */}
      {selected && (
        <div className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3 flex-wrap">
              <HiCalendarDays className="text-gray-400 text-xl" />
              <span className="font-black text-gray-800 text-base">Detail</span>
              <span
                className="font-bold text-sm text-white px-3 py-1 rounded-full"
                style={{ background: THEME[selected.mainGroup]?.dot ?? '#3b82f6' }}
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
