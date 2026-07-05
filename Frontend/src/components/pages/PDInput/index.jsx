import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  HiPlus, HiMagnifyingGlass, HiPencilSquare, HiTrash,
  HiChevronLeft, HiChevronRight, HiArrowPath,
  HiCheckCircle, HiXCircle, HiFunnel, HiArrowDownTray,
} from 'react-icons/hi2';
import { TbLoader2, TbDatabaseOff } from 'react-icons/tb';
import { MdToday } from 'react-icons/md';
import { getPdInputList, getPdInputFilters, exportPdInputCsv } from '../../../services/api';
import { toast } from '../../../lib/toast';
import PDInputModal from './components/PDInputModal';
import DeleteConfirm from './components/DeleteConfirm';

const PAGE_SIZE = 100;

const today = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (iso) => { if (!iso) return '—'; const [y, m, d] = iso.slice(0, 10).split('-'); return `${d} ${MONTHS[+m - 1]} ${y}`; };
const num = (v, d = 2) => v != null ? Number(v).toLocaleString('en', { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

/* ── DL Eff badge ── */
function DlBadge({ value, target = 3.1 }) {
  if (value == null) return <span className="text-gray-300 text-sm">—</span>;
  const met = value >= target;
  return (
    <span className={`inline-flex items-center gap-1 font-black text-sm ${met ? 'text-green-600' : 'text-red-600'}`}>
      {met ? <HiCheckCircle className="text-green-500" /> : <HiXCircle className="text-red-500" />}
      {num(value)}%
    </span>
  );
}

/* ── Column header ── */
function Th({ children, right }) {
  return (
    <th className={`px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

export default function PDInputPage() {
  const [dateFrom, setDateFrom] = useState(daysAgo(7));
  const [dateTo, setDateTo] = useState(today());
  const [shift, setShift] = useState('');
  const [productGroup, setProductGroup] = useState('');
  const [productCode, setProductCode] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ shifts: [], productGroups: [], productCodes: [] });

  const [modal, setModal] = useState(null); // null | { mode:'create'|'edit', data? }
  const [delRow, setDelRow] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const timerRef = useRef(null);

  /* load filter options once */
  useEffect(() => {
    getPdInputFilters().then((f) => setFilters(f)).catch(() => { });
  }, []);

  const fetch = useCallback(() => {
    setLoading(true);
    getPdInputList({ dateFrom, dateTo, shift, productGroup, productCode, page, pageSize: PAGE_SIZE })
      .then((res) => { setData(res.data); setTotal(res.total); setLastUpdated(new Date()); })
      .catch((e) => toast.error(`Failed to load records: ${e.message}`))
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo, shift, productGroup, productCode, page]);

  useEffect(() => { fetch(); }, [fetch]);

  /* 30-second auto-refresh */
  useEffect(() => {
    if (!autoRefresh) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(fetch, 30_000);
    return () => clearInterval(timerRef.current);
  }, [autoRefresh, fetch]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleApply = () => { setPage(1); fetch(); };

  const handleClear = () => {
    setDateFrom(daysAgo(7));
    setDateTo(today());
    setShift('');
    setProductGroup('');
    setProductCode('');
    setPage(1);
  };

  const isFiltered = dateFrom !== daysAgo(7) || dateTo !== today() || shift || productGroup || productCode;

  const handleSaved = () => { setModal(null); setDelRow(null); fetch(); };

  const handleExport = () => {
    exportPdInputCsv({ dateFrom, dateTo, shift, productGroup, productCode })
      .catch((e) => toast.error(`Export failed: ${e.message}`));
  };

  return (
    <div className="space-y-5 pb-10">

      {/* ── Filter card ── */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-wrap items-end gap-4">

          {/* Date range */}
          <div className="flex items-end gap-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Date From</label>
              <input type="date" value={dateFrom} max={dateTo} onChange={(e) => setDateFrom(e.target.value)}
                className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" />
            </div>
            <span className="text-gray-300 font-bold mb-2">→</span>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Date To</label>
              <input type="date" value={dateTo} min={dateFrom} max={today()} onChange={(e) => setDateTo(e.target.value)}
                className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" />
            </div>
          </div>

          {/* Shift */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Shift</label>
            <div className="flex gap-1.5">
              {[{ v: '', l: 'All' }, { v: 'A', l: 'A' }, { v: 'B', l: 'B' }, { v: 'C', l: 'C' }].map(({ v, l }) => (
                <button key={v} onClick={() => setShift(v)}
                  className={`h-10 w-12 rounded-xl text-sm font-bold border-2 transition-all ${shift === v ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                    }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Product Group */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Product Group</label>
            <select value={productGroup} onChange={(e) => setProductGroup(e.target.value)}
              className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition min-w-[160px]">
              <option value="">All</option>
              {filters.productGroups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Apply */}
          <button onClick={handleApply} disabled={loading}
            className="h-10 flex items-center gap-2 px-5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition shadow-md shadow-blue-200">
            {loading ? <TbLoader2 className="animate-spin" /> : <HiMagnifyingGlass />}
            Apply
          </button>

          {/* Clear Filter */}
          <button
            onClick={handleClear}
            disabled={!isFiltered}
            className={`h-10 flex items-center gap-2 px-4 text-sm font-bold rounded-xl border-2 transition-all ${isFiltered
              ? 'border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50'
              : 'border-gray-100 text-gray-300 cursor-not-allowed'
              }`}
          >
            <HiFunnel className="text-base" />
            Clear
          </button>

          {/* Export + Add (push to right) */}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={handleExport}
              className="h-10 flex items-center gap-2 px-4 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition">
              <HiArrowDownTray className="text-base" />
              Export CSV
            </button>
            <button onClick={() => setModal({ mode: 'create' })}
              className="h-10 flex items-center gap-2 px-6 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-200">
              <HiPlus className="text-lg" />
              Add Record
            </button>
          </div>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

        {/* table toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MdToday className="text-gray-400 text-lg" />
            <span className="font-black text-gray-800">Data Records</span>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full ml-1">
              {total.toLocaleString()} records
            </span>
            {lastUpdated && (
              <span className="text-[10px] text-gray-300 ml-2">
                Updated {lastUpdated.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAutoRefresh((v) => !v)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
              {autoRefresh ? '⟳ Auto' : 'Auto off'}
            </button>
            <button onClick={fetch} disabled={loading}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
              <HiArrowPath className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <TbDatabaseOff className="text-5xl text-gray-200" />
            <p className="text-sm font-medium">No data in selected range</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <Th>No</Th>
                  <Th>Date</Th>
                  <Th>Shift</Th>
                  <Th>Machine</Th>
                  <Th>Product Group</Th>
                  <Th>Product Code</Th>
                  <Th right>Run Time</Th>
                  <Th right>Actual HC</Th>
                  <Th right>Actual Output</Th>
                  <Th right>Loss Hr</Th>
                  <Th right>Prod STD</Th>
                  <Th right>Prod AC</Th>
                  <Th right>DL Eff %</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row, idx) => (
                  <tr key={row.record_id}
                    className={`hover:bg-blue-50/30 transition-colors ${row.dl_eff_percent != null && row.dl_eff_percent < 3.1 ? 'bg-red-50/20' : ''}`}>
                    <td className="px-4 py-3 text-xs text-gray-300 tabular-nums">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-600 whitespace-nowrap">{fmt(row.production_date)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 text-xs font-black rounded-xl">{row.shift_code}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{row.machine_code}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{row.product_group_name}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{row.product_code}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-600">{num(row.machine_run_time, 1)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-600">{row.actual_hc ?? '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">{row.actual_output != null ? Number(row.actual_output).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-500">{num(row.loss_hour)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-500">{num(row.productivity_std_pcs_mh)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-500">{num(row.productivity_ac_pcs_mh)}</td>
                    <td className="px-4 py-3 text-right">
                      <DlBadge value={row.dl_eff_percent} target={3.1} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ mode: 'edit', data: row })}
                          className="w-8 h-8 flex items-center justify-center text-blue-500 hover:bg-blue-100 rounded-lg transition">
                          <HiPencilSquare className="text-base" />
                        </button>
                        <button onClick={() => setDelRow(row)}
                          className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-100 rounded-lg transition">
                          <HiTrash className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-400 font-medium">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, total).toLocaleString()}–{Math.min(page * PAGE_SIZE, total).toLocaleString()} of {total.toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-blue-300 disabled:opacity-40 transition">
                <HiChevronLeft /> Prev
              </button>
              <span className="px-3 py-1.5 text-xs font-black text-blue-600 bg-blue-50 rounded-lg">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-blue-300 disabled:opacity-40 transition">
                Next <HiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* modals */}
      {modal && (
        <PDInputModal
          mode={modal.mode}
          initialData={modal.data}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {delRow && (
        <DeleteConfirm
          record={delRow}
          onClose={() => setDelRow(null)}
          onDeleted={handleSaved}
        />
      )}
    </div>
  );
}
