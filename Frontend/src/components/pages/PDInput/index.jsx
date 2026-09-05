import { useEffect, useRef, useState, useCallback,useMemo } from "react";
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiChevronLeft,
  HiChevronRight,
  HiArrowPath,
  HiCheckCircle,
  HiXCircle,
  HiFunnel,
  HiArrowDownTray,
} from "react-icons/hi2";
import { IoMdArrowDropup, IoMdArrowDropdown } from "react-icons/io";
import { TbLoader2, TbDatabaseOff } from "react-icons/tb";
import { MdToday } from "react-icons/md";
import {
  getPdInputList,
  getPdInputFilters,
  exportPdInputCsv,
} from "../../../services/api";
import { toast } from "../../../lib/toast";
import { useAuth } from "../../../context/AuthContext";
import { useAutoRefresh } from "../../../hooks/useAutoRefresh";
import PDInputModal from "./components/PDInputModal";
import DeleteConfirm from "./components/DeleteConfirm";
import { todayStr as today, daysAgoStr as daysAgo } from "../../../utils/date";
import Selected from "../../shared/Selected";
import DatePicker from "../../shared/DatePicker";

const PAGE_SIZE = 20;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const fmt = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d} ${MONTHS[+m - 1]} ${y}`;
};
const num = (v, d = 2) =>
  v != null
    ? Number(v).toLocaleString("en", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      })
    : "—";

/* --- Color --- */
const colorShift = {
  A: {
    text: "text-amber-600",
    bg: "bg-amber-100",
    border: "border-amber-100",
    hoverBorder: "hover:border-amber-300",
  },
  B: {
    text: "text-emerald-600",
    bg: "bg-emerald-100",
    border: "border-emerald-100",
    hoverBorder: "hover:border-emerald-300",
  },
  C: {
    text: "text-indigo-600",
    bg: "bg-indigo-100",
    border: "border-indigo-100",
    hoverBorder: "hover:border-indigo-300",
  },
};
const ColorGroup = {
  Gown: {
    text: "text-blue-600",
    bg: "bg-blue-100",
    border: "border-blue-100",
  },
  Drape: {
    text: "text-teal-600",
    bg: "bg-teal-100",
    border: "border-teal-100",
  },
  CWC: {
    text: "text-violet-600",
    bg: "bg-violet-100",
    border: "border-violet-100",
  },
};

const colorProductGroup = {
  Armsleeve: ColorGroup.Gown,
  Blueline: ColorGroup.Gown,
  CLHP: ColorGroup.Gown,
  CLSP: ColorGroup.Gown,
  FPP: ColorGroup.Gown,
  Urology: ColorGroup.Gown,
  Autodrape: ColorGroup.Drape,
  Manualdrape: ColorGroup.Drape,
  MefixAuto: ColorGroup.CWC,
  MeporeAuto: ColorGroup.CWC,
  MefixManual: ColorGroup.CWC,
};
const DEFAULT_BADGE_COLOR = {
  text: "text-gray-600",
  bg: "bg-gray-100",
  border: "border-gray-100",
  hoverBorder: "hover:border-gray-300",
};

/* ── DL Eff badge ── */
function DlBadge({ value, target = 3.1 }) {
  if (value == null) return <span className="text-gray-300 text-sm">—</span>;
  const met = value >= target;
  return (
    <span
      className={`inline-flex items-center gap-1 font-black text-sm ${met ? "text-green-600" : "text-red-600"}`}
    >
      {met ? (
        <HiCheckCircle className="text-green-500" />
      ) : (
        <HiXCircle className="text-red-500" />
      )}
      {num(value)}%
    </span>
  );
}

/* ── Column header ── */
function Th({ children, right }) {
  return (
    <th
      className={`px-4 py-3 text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap ${right ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

export default function PDInputPage() {
  const { user } = useAuth();
  const canEdit = user && (user.role === "admin" || user.role === "editor");

  const [dateFrom, setDateFrom] = useState(daysAgo(7));
  const [dateTo, setDateTo] = useState(today());
  const [shift, setShift] = useState("");
  const [productGroup, setProductGroup] = useState("");
  const [productCode, setProductCode] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    shifts: [],
    productGroups: [],
    productCodes: [],
  });

  const [modal, setModal] = useState(null); // null | { mode:'create'|'edit', data? }
  const [delRow, setDelRow] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  /* load filter options once */
  useEffect(() => {
    getPdInputFilters()
      .then((f) => setFilters(f))
      .catch(() => {});
  }, []);

  const hasLoadedOnce = useRef(false);

  const fetch = useCallback(
    (background = false) => {
      background ? setRefreshing(true) : setLoading(true);
      getPdInputList({
        dateFrom,
        dateTo,
        shift,
        productGroup,
        productCode,
        page,
        pageSize: PAGE_SIZE,
      })
        .then((res) => {
          setData(res.data);
          setTotal(res.total);
          setLastUpdated(new Date());
        })
        .catch((e) => {
          if (!background) toast.error(`Failed to load records: ${e.message}`);
        })
        .finally(() => {
          background ? setRefreshing(false) : setLoading(false);
          hasLoadedOnce.current = true;
        });
    },
    [dateFrom, dateTo, shift, productGroup, productCode, page],
  );

  useEffect(() => {
    fetch(hasLoadedOnce.current);
  }, [fetch]);

  useAutoRefresh(() => fetch(true), { enabled: autoRefresh });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleClear = () => {
    setDateFrom(daysAgo(7));
    setDateTo(today());
    setShift("");
    setProductGroup("");
    setProductCode("");
    setPage(1);
  };

  const isFiltered =
    dateFrom !== daysAgo(7) ||
    dateTo !== today() ||
    shift ||
    productGroup ||
    productCode;

  const handleSaved = () => {
    setModal(null);
    setDelRow(null);
    fetch(true);
  };

  const handleExport = () => {
    exportPdInputCsv({
      dateFrom,
      dateTo,
      shift,
      productGroup,
      productCode,
    }).catch((e) => toast.error(`Export failed: ${e.message}`));
  };

  const sortedData = useMemo(() => {
    if (!data) return [];

    let result = [...data];

    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        // จัดการกรณีค่าเป็น null หรือ undefined
        if (valA == null && valB != null)
          return sortConfig.direction === "asc" ? -1 : 1;
        if (valB == null && valA != null)
          return sortConfig.direction === "asc" ? 1 : -1;
        if (valA == null && valB == null) return 0;

        // กรณีที่เป็นตัวเลข (DL Eff %)
        if (sortConfig.key === "dlEff") {
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }

        // กรณีที่เป็น String (Machine, Product Code)
        const strA = String(valA);
        const strB = String(valB);
        if (sortConfig.direction === "asc") {
          return strA.localeCompare(strB, undefined, { numeric: true });
        } else {
          return strB.localeCompare(strA, undefined, { numeric: true });
        }
      });
    }

    return result;
  }, [data, sortConfig]);

  const getPaginationItems = (currentPage, totalPages) => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      start = 1;
      end = 5;
    }

    if (currentPage >= totalPages - 2) {
      start = totalPages - 4;
      end = totalPages;
    }

    if (start > 1) {
      pages.push(1);

      if (start > 2) {
        pages.push("...");
      }
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const rows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, page]);

  const handleSort = (key, isAscending) => {
    setSortConfig({
      key: key,
      direction: isAscending ? "asc" : "desc",
    });
  };

  return (
    <div className="space-y-5 pb-10">
      {/* ── Filter card ── */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-wrap items-end gap-4">
          {/* Date range */}
          <div className="flex items-end gap-2">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                Date From
              </label>
              <DatePicker
                className="w-36"
                value={dateFrom}
                max={dateTo}
                onChange={(v) => {
                  setPage(1);
                  setDateFrom(v);
                }}
              />
            </div>
            <span className="text-gray-600 font-bold mb-2">→</span>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                Date To
              </label>
              <DatePicker
                className="w-36"
                value={dateTo}
                min={dateFrom}
                max={today()}
                onChange={(v) => {
                  setPage(1);
                  setDateTo(v);
                }}
              />
            </div>
          </div>

          {/* Shift */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
              Shift
            </label>
            <div className="flex gap-1.5">
              {[
                { v: "", l: "All" },
                { v: "A", l: "A" },
                { v: "B", l: "B" },
                { v: "C", l: "C" },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => {
                    setPage(1);
                    setShift(v);
                  }}
                  className={`h-10 w-12 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                    shift === v
                      ? v == ""
                        ? "bg-blue-800 text-blue-50 border-blue-800 shadow-md"
                        : `${colorShift[v].bg} ${colorShift[v].border} ${colorShift[v].text} shadow-md`
                      : `bg-white text-gray-500 border-gray-200 ${v == "" ? "hover:border-blue-300" : `${colorShift[v].hoverBorder}`}`
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Product Group */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1.5">
              Product Group
            </label>
            <Selected
              className="w-40"
              value={productGroup}
              options={filters.productGroups}
              emptyLabel="All"
              onChange={(value) => {
                setPage(1);
                setProductGroup(value);
              }}
            />
            {/* <select
              value={productGroup}
              onChange={(e) => {
                setPage(1);
                setProductGroup(e.target.value);
              }}
              className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition cursor-pointer"
            >
              <option value="">All</option>
              {filters.productGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select> */}
          </div>

          {/* Clear Filter */}
          <button
            onClick={handleClear}
            disabled={!isFiltered}
            className={`h-10 flex items-center gap-2 px-4 text-sm font-bold rounded-xl border-2 transition-all  ${
              isFiltered
                ? "border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                : "border-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            <HiFunnel className="text-base" />
            Clear
          </button>

          {/* Export + Add (push to right) */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleExport}
              className="h-10 flex items-center gap-2 px-4 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:border-green-400 hover:text-green-800 hover:bg-green-200 transition cursor-pointer"
            >
              <HiArrowDownTray className="text-base" />
              Export CSV
            </button>
            {canEdit && (
              <button
                onClick={() => setModal({ mode: "create" })}
                className="h-10 flex items-center gap-2 px-6 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-200 cursor-pointer"
              >
                <HiPlus className="text-lg" />
                Add Record
              </button>
            )}
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
              <span className="text-[10px] text-gray-300 ml-2 flex items-center gap-1">
                {refreshing && (
                  <TbLoader2 className="animate-spin text-gray-300" />
                )}
                Updated{" "}
                {lastUpdated.toLocaleTimeString("en", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  timeZone: "Asia/Bangkok",
                })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh((v) => !v)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition shadow-lg ${autoRefresh ? "bg-green-100 text-green-700 hover:bg-green-700 hover:text-green-100" : "bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-400 hover:text-gray-100"} cursor-pointer`}
            >
              {autoRefresh ? "⟳ Auto" : "Auto off"}
            </button>
            <button
              onClick={() => fetch(true)}
              disabled={loading || refreshing}
              className="w-8 h-8 flex items-center justify-center rounded-xl shadow-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
            >
              <HiArrowPath
                className={loading || refreshing ? "animate-spin " : ""}
              />
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
          <div
            className={`overflow-x-auto transition-opacity duration-200 ${refreshing ? "opacity-60" : "opacity-100"}`}
          >
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  <Th>No</Th>
                  <Th>Date</Th>
                  <Th>Shift</Th>
                  <th className="px-3 py-3 text-left text-[12px] font-bold text-gray-600 uppercase tracking-wide">
                    <div className="flex items-center gap-1">
                      Machine
                      <div className="flex flex-col text-lg -space-y-2 cursor-pointer">
                        <IoMdArrowDropup
                          className={`hover:text-blue-600 transition-colors ${sortConfig.key === "machine_code" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-300"}`}
                          onClick={() => handleSort("machine_code", true)}
                        />
                        <IoMdArrowDropdown
                          className={`hover:text-blue-600 transition-colors ${sortConfig.key === "machine_code" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-300"}`}
                          onClick={() => handleSort("machine_code", false)}
                        />
                      </div>
                    </div>
                  </th>
                  <Th>Product Group</Th>
                  <th className="px-3 py-3 text-left text-[12px] font-bold text-gray-600 uppercase tracking-wide">
                    <div className="flex items-center gap-1">
                      Product Code
                      <div className="flex flex-col text-lg -space-y-2 cursor-pointer">
                        <IoMdArrowDropup
                          className={`hover:text-blue-600 transition-colors ${sortConfig.key === "product_code" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-300"}`}
                          onClick={() => handleSort("product_code", true)}
                        />
                        <IoMdArrowDropdown
                          className={`hover:text-blue-600 transition-colors ${sortConfig.key === "product_code" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-300"}`}
                          onClick={() => handleSort("product_code", false)}
                        />
                      </div>
                    </div>
                  </th>
                  <Th right>Run Time</Th>
                  <Th right>Actual HC</Th>
                  <Th right>Actual Output</Th>
                  <Th right>Loss Hr</Th>
                  <Th>Loss Reason</Th>
                  <Th right>Prod STD</Th>
                  <Th right>Prod AC</Th>
                  <th className="px-3 py-3 text-right text-[12px] font-bold text-gray-600 uppercase tracking-wide">
                    <div className="flex items-center justify-end gap-1">
                      DL Eff %
                      <div className="flex flex-col text-lg -space-y-2 cursor-pointer">
                        <IoMdArrowDropup
                          className={`hover:text-blue-600 transition-colors ${sortConfig.key === "dl_eff_percent" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-300"}`}
                          onClick={() => handleSort("dl_eff_percent", true)}
                        />
                        <IoMdArrowDropdown
                          className={`hover:text-blue-600 transition-colors ${sortConfig.key === "dl_eff_percent" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-300"}`}
                          onClick={() => handleSort("dl_eff_percent", false)}
                        />
                      </div>
                    </div>
                  </th>
                  {canEdit && <Th>Actions</Th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, idx) => (
                  <tr
                    key={row.record_id}
                    className={`transition-colors ${row.dl_eff_percent != null && row.dl_eff_percent < 3.1 ? "bg-red-100/40 hover:bg-red-300/50" : "bg-green-100/40 hover:bg-green-300/50"}`}
                  >
                    <td className="px-4 py-3 text-xs text-gray-900 tabular-nums">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-600 whitespace-nowrap">
                      {fmt(row.production_date)}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const c =
                          colorShift[row.shift_code] ?? DEFAULT_BADGE_COLOR;
                        return (
                          <span
                            className={`${c.text} ${c.bg} ${c.border} inline-flex items-center justify-center w-8 h-8 text-xs font-black rounded-xl`}
                          >
                            {row.shift_code}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      {row.machine_code}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const c =
                          colorProductGroup[row.product_group_name] ??
                          DEFAULT_BADGE_COLOR;
                        return (
                          <span
                            className={`${c.text} ${c.bg} ${c.border}  text-xs font-medium px-2.5 py-1 rounded-full`}
                          >
                            {row.product_group_name}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">
                      {row.product_code}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                      {num(row.machine_run_time, 1)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                      {row.actual_hc ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold text-gray-800">
                      {row.actual_output != null
                        ? Number(row.actual_output).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                      {num(row.loss_hour)}
                    </td>
                    <td
                      className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate"
                      title={row.loss_reason ?? ""}
                    >
                      {row.loss_reason || "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                      {num(row.productivity_std_pcs_mh)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                      {num(row.productivity_ac_pcs_mh)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DlBadge value={row.dl_eff_percent} target={3.1} />
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setModal({ mode: "edit", data: row })
                            }
                            title="Edit"
                            className="w-8 h-8 flex items-center justify-center text-blue-500 hover:bg-blue-100 rounded-lg transition"
                          >
                            <HiPencilSquare className="text-base" />
                          </button>
                          <button
                            onClick={() => setDelRow(row)}
                            title="Delete"
                            className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-100 rounded-lg transition"
                          >
                            <HiTrash className="text-base" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6  border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-400 font-medium">
              Showing{" "}
              {Math.min((page - 1) * PAGE_SIZE + 1, total).toLocaleString()}–
              {Math.min(page * PAGE_SIZE, total).toLocaleString()} of{" "}
              {total.toLocaleString()}
            </span>
            <div className="flex items-center justify-center gap-2 my-4">
              {/* Previous */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                title="Previous page"
                className="flex items-center gap-1 px-3 h-8 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl cursor-pointer
                        hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-allshadow-sm"
              >
                <HiChevronLeft />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPaginationItems(page, totalPages).map((item, index) => {
                  if (item === "...") {
                    return (
                      <span
                        key={`dots-${index}`}
                        className="w-8 h-8 flex items-center justify-center text-gray-300 text-sm select-none"
                      >
                        …
                      </span>
                    );
                  }

                  return (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={` w-8 h-8 rounded-xl text-xs font-blacktransition-all cursor-pointer
                                ${page === item ? ` bg-blue-600 text-white shadow-md shadow-blue-200 scale-105` : ` text-gray-500 bg-white hover:bg-blue-50 hover:text-blue-600`}
                                `}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              {/* Next */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                title="Next page"
                className="flex items-center gap-1 px-3 h-8 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl cursor-pointer
                        hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm "
              >
                <span className="hidden sm:inline">Next</span>
                <HiChevronRight />
              </button>
            </div>
            {/* <div className="flex items-center gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-blue-300 disabled:opacity-40 transition">
                <HiChevronLeft /> Prev
              </button>
              <span className="px-3 py-1.5 text-xs font-black text-blue-600 bg-blue-50 rounded-lg">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-blue-300 disabled:opacity-40 transition">
                Next <HiChevronRight />
              </button>
            </div> */}
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
