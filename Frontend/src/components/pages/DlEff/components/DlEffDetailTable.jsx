import { useState, useMemo } from "react";
import {
  HiCheckCircle,
  HiXCircle,
  HiChevronLeft,
  HiChevronRight,
  HiTableCells,
  HiMiniArchiveBox,
  HiChatBubbleBottomCenterText,
} from "react-icons/hi2";
import { IoMdArrowDropup, IoMdArrowDropdown } from "react-icons/io";
import { MdOutlineSpeed } from "react-icons/md";
import LossReasonModal from "../../../shared/LossReasonModal";

const PAGE_SIZE = 10;
const fmtEntryTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok",
      })
    : "—";
const num = (v, dec = 2) =>
  v != null
    ? Number(v).toLocaleString("en", {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      })
    : "—";

function StatusCell({ dlEff, target }) {
  if (dlEff == null) return <span className="text-gray-300">—</span>;
  const met = target != null && dlEff >= target;
  return (
    <span
      className={`inline-flex items-center gap-1 font-black text-sm ${met ? "text-green-600" : "text-red-600"}`}
    >
      {met ? (
        <HiCheckCircle className="text-green-500 flex-shrink-0" />
      ) : (
        <HiXCircle className="text-red-500 flex-shrink-0" />
      )}
      {dlEff.toFixed(2)}%
    </span>
  );
}

function StatCard({ label, value, Icon, colorClass, bgClass }) {
  return (
    <div className={`${bgClass} rounded-2xl p-4 flex items-center gap-3`}>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} bg-white shadow-sm`}
      >
        <Icon className="text-xl" />
      </div>
      <div>
        <div className="text-2xl font-black text-gray-800 leading-none">
          {value}
        </div>
        <div className="text-xs text-gray-500 mt-0.5 font-medium">{label}</div>
      </div>
    </div>
  );
}

function Th({ children, right }) {
  return (
    <th
      className={`px-2 py-2.5 text-[11px] font-bold text-gray-700 uppercase tracking-wide leading-tight ${right ? "text-right" : "text-left"}`}
    >
      <div className="flex justify-center">{children}</div>
    </th>
  );
}

export default function DlEffDetailTable({ data, loading, target }) {
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [lossReasonModal, setLossReasonModal] = useState(null); // null | { text, meta }

  const totalPages = Math.ceil((data?.length ?? 0) / PAGE_SIZE);
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

        // กรณีที่เป็นวันที่ (Entry Time)
        if (sortConfig.key === "ENTRY_TIME") {
          const timeA = new Date(valA).getTime();
          const timeB = new Date(valB).getTime();
          return sortConfig.direction === "asc" ? timeA - timeB : timeB - timeA;
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

  // 4. ตัดแบ่งหน้า (Pagination) จากข้อมูลที่ถูก Sort แล้ว
  const rows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, page]);

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

  const metCount = data.filter(
    (r) => r.dlEff != null && target != null && r.dlEff >= target,
  ).length;
  const missCount = data.filter(
    (r) => r.dlEff != null && target != null && r.dlEff < target,
  ).length;
  const noDataCount = data.filter((r) => r.dlEff == null).length;
  const actualOutputSummary = data
    .filter((r) => r.dlEff != null)
    .reduce((sum, r) => sum + Number(r.ACTUAL_OUTPUT), 0);

  const handleSort = (key, isAscending) => {
    setSortConfig({
      key: key,
      direction: isAscending ? "asc" : "desc",
    });
  };

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Records"
          value={data.length.toLocaleString()}
          Icon={HiTableCells}
          colorClass="text-blue-600"
          bgClass="bg-blue-50 border border-blue-100"
        />
        <StatCard
          label="Met Target"
          value={metCount.toLocaleString()}
          Icon={HiCheckCircle}
          colorClass="text-green-600"
          bgClass="bg-green-50 border border-green-100"
        />
        <StatCard
          label="Below Target"
          value={missCount.toLocaleString()}
          Icon={HiXCircle}
          colorClass="text-red-500"
          bgClass="bg-red-50 border border-red-100"
        />
        <StatCard
          label="Summary ActualOutput"
          value={actualOutputSummary.toLocaleString()}
          Icon={HiMiniArchiveBox}
          colorClass="text-indigo-500"
          bgClass="bg-indigo-50 border border-indigo-100"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-xs text-gray-500 font-medium">
            Showing{" "}
            {Math.min((page - 1) * PAGE_SIZE + 1, data.length).toLocaleString()}
            –{Math.min(page * PAGE_SIZE, data.length).toLocaleString()} of{" "}
            {data.length.toLocaleString()} records
            {noDataCount > 0 && (
              <span className="text-gray-400 ml-2">
                · {noDataCount} no mc_speed
              </span>
            )}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MdOutlineSpeed className="text-amber-500" />
            Target:{" "}
            <strong className="text-gray-600 ml-1">{target ?? "—"}%</strong>
          </div>
        </div>

        <div className="w-full">
          <table className="w-full text-sm break-words">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 ">
                <Th>No</Th>
                <th className="px-2 py-2.5 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide flex justify-center h-full">
                  <div className="flex items-center gap-1">
                    Date
                    <div className="flex flex-col text-[16px] -space-y-2 cursor-pointer">
                      <IoMdArrowDropup
                        className={`hover:text-blue-600 transition-colors ${sortConfig.key === "ENTRY_TIME" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-300"}`}
                        onClick={() => handleSort("ENTRY_TIME", true)}
                      />
                      <IoMdArrowDropdown
                        className={`hover:text-blue-600 transition-colors ${sortConfig.key === "ENTRY_TIME" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-300"}`}
                        onClick={() => handleSort("ENTRY_TIME", false)}
                      />
                    </div>
                  </div>
                </th>
                <Th>Shift</Th>
                <th className="px-2 py-2.5 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                  <div className="flex items-center gap-1">
                    Machine
                    <div className="flex flex-col text-[16px] -space-y-2 cursor-pointer">
                      <IoMdArrowDropup
                        className={`hover:text-blue-600 transition-colors ${sortConfig.key === "MACHINE" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-300"}`}
                        onClick={() => handleSort("MACHINE", true)}
                      />
                      <IoMdArrowDropdown
                        className={`hover:text-blue-600 transition-colors ${sortConfig.key === "MACHINE" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-300"}`}
                        onClick={() => handleSort("MACHINE", false)}
                      />
                    </div>
                  </div>
                </th>
                <th className="px-2 py-2.5 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                  <div className="flex items-center gap-1">
                    Product Code
                    <div className="flex flex-col text-[16px] -space-y-2 cursor-pointer">
                      <IoMdArrowDropup
                        className={`hover:text-blue-600 transition-colors ${sortConfig.key === "PRODUCT_CODE" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-300"}`}
                        onClick={() => handleSort("PRODUCT_CODE", true)}
                      />
                      <IoMdArrowDropdown
                        className={`hover:text-blue-600 transition-colors ${sortConfig.key === "PRODUCT_CODE" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-300"}`}
                        onClick={() => handleSort("PRODUCT_CODE", false)}
                      />
                    </div>
                  </div>
                </th>
                <Th right>Run Time</Th>
                <Th right>Std HC</Th>
                <Th right>Actual HC</Th>
                <Th right>Actual Output</Th>
                <Th>Loss Reason</Th>
                <Th right>Std Output</Th>
                <Th right>Prod STD</Th>
                <Th right>Prod AC</Th>
                <th className="px-2 py-2.5 text-right text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                  <div className="flex items-center justify-end gap-1">
                    DL Eff %
                    <div className="flex flex-col text-[16px] -space-y-2 cursor-pointer">
                      <IoMdArrowDropup
                        className={`hover:text-blue-600 transition-colors ${sortConfig.key === "dlEff" && sortConfig.direction === "asc" ? "text-blue-600" : "text-gray-300"}`}
                        onClick={() => handleSort("dlEff", true)}
                      />
                      <IoMdArrowDropdown
                        className={`hover:text-blue-600 transition-colors ${sortConfig.key === "dlEff" && sortConfig.direction === "desc" ? "text-blue-600" : "text-gray-300"}`}
                        onClick={() => handleSort("dlEff", false)}
                      />
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => {
                const met =
                  row.dlEff != null && target != null && row.dlEff >= target;
                const isMiss = row.dlEff != null && !met;
                const colorShift = {
                  A: {
                    text: "text-amber-600",
                    bg: "bg-amber-100",
                    border: "border-amber-100",
                  },
                  B: {
                    text: "text-emerald-600",
                    bg: "bg-emerald-100",
                    border: "border-emerald-100",
                  },
                  C: {
                    text: "text-indigo-600",
                    bg: "bg-indigo-100",
                    border: "border-indigo-100",
                  },
                };
                const shiftColor = colorShift[row.SHIFT] ?? {
                  text: "text-gray-600",
                  bg: "bg-gray-100",
                  border: "border-gray-100",
                };
                return (
                  <tr
                    key={row.ID}
                    className={`transition-colors ${isMiss ? "bg-red-100/40 hover:bg-red-300/50" : "bg-green-100/40 hover:bg-green-300/50"}`}
                  >
                    <td className="px-2 py-2.5 text-xs text-gray-700 tabular-nums">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-2 py-2.5 text-xs font-medium text-gray-600">
                      {fmtEntryTime(row.ENTRY_TIME)}
                    </td>
                    <td className="px-2 py-2.5">
                      {/* <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-black"> */}
                      <span
                        className={`${shiftColor.bg} ${shiftColor.text} ${shiftColor.border}
                            inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black
                        `}
                      >
                        {row.SHIFT ?? "—"}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 font-semibold text-gray-700 text-xs">
                      {row.MACHINE ?? "—"}
                    </td>
                    <td className="px-2 py-2.5 text-xs font-mono text-gray-500">
                      {row.PRODUCT_CODE ?? "—"}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-gray-600 text-xs">
                      {num(row.MC_RUN_TIME, 0)}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-gray-600 text-xs">
                      {num(row.STD_HC, 0)}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums font-semibold text-gray-700 text-xs">
                      {row.ACTUAL_HC ?? "—"}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums font-semibold text-gray-800 text-xs">
                      {row.ACTUAL_OUTPUT != null
                        ? Number(row.ACTUAL_OUTPUT).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      {row.LOSS_REASON ? (
                        <button
                          onClick={() =>
                            setLossReasonModal({
                              text: row.LOSS_REASON,
                              meta: [
                                fmtEntryTime(row.ENTRY_TIME),
                                row.MACHINE,
                                row.PRODUCT_CODE,
                              ],
                            })
                          }
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-amber-500 hover:bg-amber-100 hover:text-amber-600 transition cursor-pointer"
                          title="View loss reason"
                        >
                          <HiChatBubbleBottomCenterText className="text-base" />
                        </button>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-gray-600 text-xs">
                      {row.STD_OUTPUT != null
                        ? Number(row.STD_OUTPUT).toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })
                        : "—"}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-gray-500 text-xs">
                      {num(row.productivity_std_pcs_mh)}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums text-gray-500 text-xs">
                      {num(row.productivity_ac_pcs_mh)}
                    </td>
                    <td className="px-2 py-2.5 text-right">
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
          <div className="flex items-center justify-end gap-2 my-4 px-4">
            {/* Previous */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              title="Previous page"
              className="flex items-center gap-1 px-3 h-8 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl
            hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-allshadow-sm cursor-pointer"
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
                    className={` w-8 h-8 rounded-xl text-xs font-blacktransition-all
                    ${page === item ? ` bg-blue-600 text-white shadow-md shadow-blue-200 scale-105` : ` text-gray-500 bg-white hover:bg-blue-50 hover:text-blue-600 cursor-pointer`}
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
              className="flex items-center gap-1 px-3 h-8 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-xl
            hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              <span className="hidden sm:inline ">Next</span>
              <HiChevronRight />
            </button>
          </div>
        )}
      </div>

      {lossReasonModal && (
        <LossReasonModal
          title="Loss Reason"
          text={lossReasonModal.text}
          meta={lossReasonModal.meta}
          onClose={() => setLossReasonModal(null)}
        />
      )}
    </div>
  );
}
