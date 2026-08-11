import { useEffect, useRef, useState, useCallback } from "react";
import {
  HiCalendar,
  HiCalendarDays,
  HiChartBar,
  HiCheckCircle,
  HiXCircle,
  HiXMark,
  HiExclamationTriangle,
  HiFunnel,
} from "react-icons/hi2";
import { TbLoader2 } from "react-icons/tb";
import { MdToday, MdDateRange } from "react-icons/md";
import { BiSolidFactory } from "react-icons/bi";
import DlEffDetailTable from "./components/DlEffDetailTable";
import { getDlEffOverview, getDlEffDetail } from "../../../services/api";
import { toast } from "../../../lib/toast";
import { useAutoRefresh } from "../../../hooks/useAutoRefresh";
import { todayStr as today, daysAgoStr as daysAgo } from "../../../utils/date";
import ProjectProgress from "./components/DlEffChart";

const PERIODS = [
  { key: "daily", label: "Daily", Icon: MdToday },
  { key: "weekly", label: "Weekly", Icon: HiCalendar },
  { key: "monthly", label: "Monthly", Icon: MdDateRange },
  { key: "yearly", label: "Yearly", Icon: HiChartBar },
];
const PERIOD_DAYS = { daily: 1, weekly: 7, monthly: 30, yearly: 365 };

const MAIN_GROUP_ORDER = ["Gown", "Drape", "CWC"];
const DEFAULT_TARGETS = { Gown: 3.1, Drape: 3.1, CWC: 6.0 };

const THEME = {
  Gown: {
    text: "text-blue-600",
    bg: "bg-blue-100",
    bgicon: "bg-blue-200",
    border: "border-blue-100",
    bar: "bg-blue-500",
    dot: "#3b82f6",
  },
  Drape: {
    text: "text-teal-600",
    bg: "bg-teal-100",
    bgicon: "bg-teal-200",
    border: "border-teal-100",
    bar: "bg-teal-500",
    dot: "#14b8a6",
  },
  CWC: {
    text: "text-violet-600",
    bg: "bg-violet-100",
    bgicon: "bg-violet-200",
    border: "border-violet-100",
    bar: "bg-violet-500",
    dot: "#10b981",
  },
};

const colorShift = {
  A: {
    text: "text-amber-600",
    bg: "bg-amber-100",
    border: "border-amber-100",
    hoverBorder:"hover:border-amber-300"
  },
  B: {
    text: "text-emerald-600",
    bg: "bg-emerald-100",
    border: "border-emerald-100",
    hoverBorder:"hover:border-emerald-300"
  },
  C: {
    text: "text-indigo-600",
    bg: "bg-indigo-100",
    border: "border-indigo-100",
    hoverBorder:"hover:border-indigo-300"
  },
};

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
const fmtDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d} ${MONTHS[+m - 1]} ${y}`;
};

// Half-circle gauge — plain SVG arc (no chart library), same 0..target*2 scale as the DL Eff bar.
function HalfGauge({ value, target, met, noData }) {
  const W = 108,
    H = 58,
    CX = W / 2,
    CY = H - 4,
    R = 42,
    TRACK = 9;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const pt = (deg, r) => [
    CX - r * Math.cos(toRad(deg)),
    CY - r * Math.sin(toRad(deg)),
  ];
  const arcD = (fromDeg, toDeg, r) => {
    if (toDeg - fromDeg < 0.5) return "";
    const [x1, y1] = pt(fromDeg, r);
    const [x2, y2] = pt(Math.min(toDeg, 179.99), r);
    return `M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`;
  };

  const scale = target ? target * 2 : 10;
  const filled = noData ? 0 : Math.min(Math.max(value, 0), scale);
  const filledDeg = (filled / scale) * 180;
  const color = noData ? "#d1d5db" : met ? "#16a34a" : "#dc2626";

  return (
    <div className="relative flex-shrink-0" style={{ width: W, height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
        <path
          d={arcD(0, 180, R)}
          fill="none"
          stroke="#d0d0d0"
          strokeWidth={TRACK}
          strokeLinecap="round"
        />
        {filledDeg > 0 && (
          <path
            d={arcD(0, filledDeg, R)}
            fill="none"
            stroke={color}
            strokeWidth={TRACK}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pointer-events-none pb-0.5">
        <span
          className={`text-lg font-black leading-none ${noData ? "text-gray-300" : met ? "text-green-600" : "text-red-600"}`}
        >
          {noData ? "—" : `${value.toFixed(1)}%`}
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
      className={`group w-full text-left rounded-2xl p-4 border-2 transition-all duration-200 cursor-pointer ${
        selected
          ? "border-blue-500 shadow-lg ring-4 ring-blue-100 bg-blue-100"
          : "border-gray-100 hover:border-gray-300 hover:shadow-sm bg-[#F8FAFC]"
      }`}
    >
      <ProjectProgress
        subGroup={sg.subGroup}
        data={noData}
        met={met}
        dlEff={sg.dlEff}
        target={target}
        showShifts={showShifts}
        shifts={sg.shifts}
        selected={selected}
      />
    </button>
  );
}

function MainGroupSection({ mg, showShifts, selected, onSelectSub }) {
  const theme = THEME[mg.group] ?? THEME.Gown;
  const met = mg.meetsTarget === true;
  const noData = mg.meetsTarget === null;

  return (
    <div className="my-4">
      <div
        className={`flex items-center justify-between px-6 rounded-t-3xl py-2 border border-gray-200 ${theme.bg} `}
      >
        <div className="flex items-center gap-3 ">
          <div
            className={`w-10 h-10 rounded-xl  flex items-center justify-center ${theme.bgicon}`}
          >
            <BiSolidFactory className={`text-lg ${theme.text}`} />
          </div>
          <div>
            <div className="font-black text-gray-900 text-base leading-none">
              {mg.group}
            </div>
            <div className="text-gray-600 text-xs mt-1 font-medium">
              {mg.subGroups.length} product group
              {mg.subGroups.length !== 1 ? "s" : ""} · Target {mg.target ?? "—"}
              %
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 ">
          <HalfGauge
            value={mg.dlEff}
            target={mg.target}
            met={met}
            noData={noData}
          />
          <div
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
              noData
                ? "bg-gray-100 text-gray-500"
                : met
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
            }`}
          >
            {noData ? null : met ? (
              <HiCheckCircle className="text-sm" />
            ) : (
              <HiXCircle className="text-sm" />
            )}
            {noData ? "No Data" : met ? "On Target" : "Below Target"}
          </div>
        </div>
      </div>
      <div className="rounded-b-3xl  bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 ">
          {mg.subGroups.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">
              No data in selected range
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3 ">
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
    </div>
  );
}

export default function DlEffDashboard() {
  const [period, setPeriod] = useState("daily");
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today());
  const [shift, setShift] = useState("");

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
    setShift("");
    setSelected(null);
  }, [period]);

  const defaultFrom = daysAgo(PERIOD_DAYS[period]);
  const isFiltered = dateFrom !== defaultFrom || dateTo !== today() || !!shift;

  const handleClear = () => {
    setDateFrom(daysAgo(PERIOD_DAYS[period]));
    setDateTo(today());
    setShift("");
    setSelected(null);
  };

  const buildParams = useCallback(
    () => ({
      dateFrom,
      dateTo,
      ...(shift && { shift }),
    }),
    [dateFrom, dateTo, shift],
  );

  // First load blanks the page with the big spinner; every fetch after that
  // (filter changes, period switches, auto-refresh) is a smooth background
  // refetch that keeps the existing cards on screen instead of flashing.
  const hasLoadedOnce = useRef(false);

  const fetchOverview = useCallback(
    (background = false) => {
      background ? setRefreshing(true) : setLoadingOverview(true);
      if (!background) setError(null);
      getDlEffOverview(buildParams())
        .then((res) => {
          setOverview(res.data ?? []);
          setLastUpdated(new Date());
        })
        .catch((e) => {
          if (!background) {
            setError(e.message);
            toast.error(`DL Eff load failed: ${e.message}`);
          }
        })
        .finally(() => {
          background ? setRefreshing(false) : setLoadingOverview(false);
          hasLoadedOnce.current = true;
        });
    },
    [buildParams],
  );

  useEffect(() => {
    fetchOverview(hasLoadedOnce.current);
  }, [fetchOverview]);

  useAutoRefresh(() => fetchOverview(true), { enabled: autoRefresh });

  useEffect(() => {
    if (!selected) return;
    setLoadingDetail(true);
    getDlEffDetail({ ...buildParams(), productGroup: selected.subGroup })
      .then(setDetail)
      .catch(() => setDetail({ data: [], topReasons: [] }))
      .finally(() => setLoadingDetail(false));
  }, [selected, buildParams]);

  const mainGroups = MAIN_GROUP_ORDER.map(
    (name) =>
      overview.find((g) => g.group === name) ?? {
        group: name,
        target: DEFAULT_TARGETS[name],
        dlEff: null,
        meetsTarget: null,
        subGroups: [],
      },
  );

  const handleSelectSub = (mainGroup, subGroup) =>
    setSelected((prev) =>
      prev?.subGroup === subGroup ? null : { mainGroup, subGroup },
    );

  return (
    <div className="space-y-5 ">
      {/* ── Filters ──────────────────────────────────────────────── */}
      <div className="">
        <div className="flex max-w-2/6">
          {PERIODS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-bold border rounded-t-xl cursor-pointer ${
                period === key
                  ? "border-blue-600 text-white bg-blue-800 border-b-2 "
                  : "text-gray-700 hover:text-gray-600 hover:bg-gray-100 bg-white border-gray-200"
              }`}
            >
              <Icon
                className={`text-lg ${period === key ? "text-white" : "text-gray-700"}`}
              />
              {label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-b-3xl rounded-tr-3xl  border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-end gap-4 px-6 py-4">
            <div className="flex items-end gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
              </div>
              <span className="text-gray-300 font-bold mb-2.5">→</span>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  max={today()}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-10 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
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
                    onClick={() => setShift(v)}
                    className={`h-10 px-4 rounded-xl text-sm font-bold border-2 transition-all cursor-pointer ${
                      shift === v
                       ? v == ""
                        ? "bg-blue-800 text-blue-50 border-blue-800 shadow-md"
                        : `${colorShift[v].bg} ${colorShift[v].border} ${colorShift[v].text} shadow-md`
                      : `bg-white text-gray-500 border-gray-200 ${v==""?'hover:border-blue-800':`${colorShift[v].hoverBorder}`}`
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
                isFiltered
                  ? "border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                  : "border-gray-100 text-gray-300 cursor-not-allowed"
              }`}
            >
              <HiFunnel className="text-base" />
              Clear
            </button>

            <div className="flex items-center gap-2 ml-auto">
              {refreshing && (
                <TbLoader2 className="animate-spin text-gray-400" />
              )}
              {lastUpdated && (
                <span className="text-[10px] text-gray-400">
                  Updated{" "}
                  {lastUpdated.toLocaleTimeString("en", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZone: "Asia/Bangkok",
                  })}
                </span>
              )}
              <button
                onClick={() => setAutoRefresh((v) => !v)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition cursor-pointer ${autoRefresh ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}
              >
                {autoRefresh ? "⟳ Auto" : "Auto off"}
              </button>
            </div>
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
          <span className="text-gray-400 text-sm font-medium">
            Loading data...
          </span>
        </div>
      ) : (
        <div
          className={` transition-opacity duration-200 ${refreshing ? "opacity-60" : "opacity-100"}`}
        >
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
          <div className="flex items-center justify-between px-6 py-4 bg-sky-100 border-b border-gray-100">
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className={`w-8 h-8 rounded-xl  flex items-center justify-center bg-sky-200`}
              >
                <HiCalendarDays className="text-gsky-400 text-xl bg-sky-200" />
              </div>
              <span className="font-black text-gray-800 text-lg">Detail</span>
              <span
                className={`font-bold text-sm text-white px-3 py-1 rounded-full ${THEME[selected.mainGroup]?.bar}`}
                // style={{
                //   background: THEME[selected.mainGroup]?.text ?? "#3b82f6",
                // }}
              >
                {selected.subGroup} 
              </span>
              <span className={`${THEME[selected.mainGroup]?.text ?? "#3b82f6"} text-sm font-bold`}>
                {selected.mainGroup}
              </span>
              <span className={`${THEME[selected.mainGroup]?.text ?? "#3b82f6"} text-sm`}>·</span>
              <span className="text-gray-500 text-sm">
                {fmtDate(dateFrom)}
                {period !== "daily" ? ` – ${fmtDate(dateTo)}` : ""}
              </span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className='h-10 flex items-center gap-2 px-4 text-sm font-bold rounded-xl border-2 transition-all text-red-500 border-red-300 bg-red-50 hover:border-red-300 hover:text-red-800 hover:bg-red-100 cursor-pointer'
            >
              <HiXMark className="text-base" />
              Close
            </button>
          </div>

          <div className="bg-white px-6 py-4">
            <DlEffDetailTable
              data={detail.data}
              loading={loadingDetail}
              target={
                mainGroups.find((g) => g.group === selected.mainGroup)
                  ?.target ?? null
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
