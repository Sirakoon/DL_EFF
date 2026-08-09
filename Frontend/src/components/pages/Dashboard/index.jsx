import React, { useState } from 'react';
import { TbLoader2 } from 'react-icons/tb';
import { useDashboard, useFilterOptions } from '../../../hooks/useDashboard';
import { useAutoRefresh } from '../../../hooks/useAutoRefresh';
import FilterBar from './components/FilterBar';
import KPICard from './components/KPICard';
import LossHourChart from './components/LossHourChart';
import OutputHrChart from './components/OutputHrChart';
import RunTimeLossChart from './components/RunTimeLossChart';
import MachineStatusDonut from './components/MachineStatusDonut';
import MachineRankingTable from './components/MachineRankingTable';

// KPI Icons
const MachineIcon = (
  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
);
const ClockIcon = (
  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const WarnIcon = (
  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const SpeedIcon = (
  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
    <path d="M12 6v6l4 2" strokeLinecap="round" />
  </svg>
);
const AlertIcon = (
  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />;
}

export default function Dashboard() {
  const [filters, setFilters] = useState({});
  const options = useFilterOptions();
  const { data, loading, refreshing, error, reload } = useDashboard(filters);

  /* background refresh: instant on socket push + 30s fallback poll — never blanks the page */
  useAutoRefresh(() => reload(true));

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <FilterBar filters={filters} onChange={setFilters} options={options} />
        {refreshing && (
          <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
            <TbLoader2 className="animate-spin" /> Updating…
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Failed to load data: {error}
        </div>
      )}

      <div className={`space-y-5 transition-opacity duration-200 ${refreshing ? 'opacity-60' : 'opacity-100'}`}>
        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : data ? (
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
            <KPICard
              icon={MachineIcon}
              label="Total Machines"
              value={data.kpi.machineCount.toLocaleString()}
              unit="machines"
              change={4.0}
              changeLabel="vs last week"
            />
            
            <KPICard
              icon={ClockIcon}
              label="Total Run Time"
              value={data.kpi.totalRunTime.toLocaleString()}
              unit="hrs."
              change={8.3}
              changeLabel="vs last week"
            />
            <KPICard
              icon={WarnIcon}
              label="Total Loss Hour"
              value={data.kpi.totalLossHour.toLocaleString()}
              unit="hrs."
              change={15.7}
              changeLabel="vs last week"
            />
            <KPICard
              icon={SpeedIcon}
              label="Avg Output / Hr"
              value={data.kpi.avgOutputPerHr.toLocaleString()}
              unit="pcs/hr."
              change={3.6}
              changeLabel="vs last week"
            />
            <KPICard
              icon={AlertIcon}
              label="Highest Loss Machine"
              value={data.kpi.highestLossMachine}
              unit=""
              highlight={`${data.kpi.highestLossRate}%`}
              highlightColor="text-red-500"
            />
          </div>
        ) : null}

        {/* Charts Row 1 */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LossHourChart data={data.lossByMachine} />
            <OutputHrChart data={data.outputByMachine} />
          </div>
        ) : null}

        {/* Charts Row 2 */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RunTimeLossChart data={data.runTimeVsLoss} />
            <MachineStatusDonut data={data.machineStatus} />
          </div>
        ) : null}

        {/* Ranking Table */}
        {loading ? (
          <Skeleton className="h-64" />
        ) : data ? (
          <MachineRankingTable ranking={data.ranking} />
        ) : null}
      </div>
    </div>
  );
}
