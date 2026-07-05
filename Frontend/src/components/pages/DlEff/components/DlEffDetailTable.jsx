import React, { useState, useMemo } from 'react';
import {
  HiCheckCircle, HiXCircle,
  HiChevronLeft, HiChevronRight,
  HiTableCells,
} from 'react-icons/hi2';
import { MdOutlineSpeed } from 'react-icons/md';

const PAGE_SIZE = 50;
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDate = (iso) => { if (!iso) return '—'; const [y,m,d] = iso.slice(0,10).split('-'); return `${d} ${MONTHS[+m-1]} ${y}`; };
const num = (v, dec = 2) => v != null ? Number(v).toLocaleString('en', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : '—';

function StatusCell({ dlEff, target }) {
  if (dlEff == null) return <span className="text-gray-300">—</span>;
  const met = target != null && dlEff >= target;
  return (
    <span className={`inline-flex items-center gap-1 font-black text-sm ${met ? 'text-green-600' : 'text-red-600'}`}>
      {met
        ? <HiCheckCircle className="text-green-500 flex-shrink-0" />
        : <HiXCircle className="text-red-500 flex-shrink-0" />}
      {dlEff.toFixed(2)}%
    </span>
  );
}

function StatCard({ label, value, Icon, colorClass, bgClass }) {
  return (
    <div className={`${bgClass} rounded-2xl p-4 flex items-center gap-3`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} bg-white shadow-sm`}>
        <Icon className="text-xl" />
      </div>
      <div>
        <div className="text-2xl font-black text-gray-800 leading-none">{value}</div>
        <div className="text-xs text-gray-500 mt-0.5 font-medium">{label}</div>
      </div>
    </div>
  );
}

function Th({ children, right }) {
  return (
    <th className={`px-3 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

export default function DlEffDetailTable({ data, loading, target }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil((data?.length ?? 0) / PAGE_SIZE);
  const rows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return (data ?? []).slice(start, start + PAGE_SIZE);
  }, [data, page]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-gray-400 text-sm font-medium">Loading...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
        <HiTableCells className="text-5xl text-gray-200" />
        <p className="text-sm font-medium">No data in selected range</p>
      </div>
    );
  }

  const metCount = data.filter((r) => r.dlEff != null && target != null && r.dlEff >= target).length;
  const missCount = data.filter((r) => r.dlEff != null && target != null && r.dlEff < target).length;
  const noDataCount = data.filter((r) => r.dlEff == null).length;

  return (
    <div className="space-y-4">

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Records" value={data.length.toLocaleString()}
          Icon={HiTableCells} colorClass="text-blue-600" bgClass="bg-blue-50 border border-blue-100" />
        <StatCard label="Met Target" value={metCount.toLocaleString()}
          Icon={HiCheckCircle} colorClass="text-green-600" bgClass="bg-green-50 border border-green-100" />
        <StatCard label="Below Target" value={missCount.toLocaleString()}
          Icon={HiXCircle} colorClass="text-red-500" bgClass="bg-red-50 border border-red-100" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

        {/* toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-xs text-gray-500 font-medium">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, data.length).toLocaleString()}–{Math.min(page * PAGE_SIZE, data.length).toLocaleString()} of {data.length.toLocaleString()} records
            {noDataCount > 0 && <span className="text-gray-400 ml-2">· {noDataCount} no mc_speed</span>}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MdOutlineSpeed className="text-amber-500" />
            Target: <strong className="text-gray-600 ml-1">{target ?? '—'}%</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <Th>#</Th>
                <Th>Date</Th>
                <Th>Shift</Th>
                <Th>Machine</Th>
                <Th>Product Code</Th>
                <Th right>Run Time</Th>
                <Th right>Std HC</Th>
                <Th right>Actual HC</Th>
                <Th right>Actual Output</Th>
                <Th right>Prod STD</Th>
                <Th right>Prod AC</Th>
                <Th right>DL Eff %</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => {
                const met = row.dlEff != null && target != null && row.dlEff >= target;
                const isMiss = row.dlEff != null && !met;
                return (
                  <tr key={row.ID} className={`transition-colors ${isMiss ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-gray-50/60'}`}>
                    <td className="px-3 py-3 text-xs text-gray-300 tabular-nums">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-3 py-3 text-xs font-medium text-gray-600 whitespace-nowrap">{fmtDate(row.PRODUCTION_DATE)}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-black">
                        {row.SHIFT ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-semibold text-gray-700 text-xs">{row.MACHINE ?? '—'}</td>
                    <td className="px-3 py-3 text-xs font-mono text-gray-500">{row.PRODUCT_CODE ?? '—'}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-600 text-xs">{num(row.MC_RUN_TIME, 1)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-600 text-xs">{num(row.STD_HC, 1)}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-gray-700 text-xs">{row.ACTUAL_HC ?? '—'}</td>
                    <td className="px-3 py-3 text-right tabular-nums font-semibold text-gray-800 text-xs">
                      {row.ACTUAL_OUTPUT != null ? Number(row.ACTUAL_OUTPUT).toLocaleString() : '—'}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-500 text-xs">{num(row.productivity_std_pcs_mh)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-500 text-xs">{num(row.productivity_ac_pcs_mh)}</td>
                    <td className="px-3 py-3 text-right">
                      <StatusCell dlEff={row.dlEff} target={target} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 transition shadow-sm"
            >
              <HiChevronLeft /> Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push('…'); acc.push(p); return acc; }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`d${i}`} className="px-2 text-gray-300 text-sm">…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${page === p ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 transition shadow-sm"
            >
              Next <HiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
