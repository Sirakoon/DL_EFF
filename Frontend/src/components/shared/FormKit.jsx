import { HiXMark } from "react-icons/hi2";
import { todayStr } from "../../utils/date";

/* ── shared style tokens for form inputs across CRUD modals ────────── */
const inputBase =
  "w-full h-10 border-2 border-gray-300 rounded-xl px-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400";
export const inputNormal = `${inputBase} bg-white text-gray-800 border-gray-200 hover:border-gray-300`;
export const inputError = `${inputBase} bg-white text-gray-800 border-red-300 ring-2 ring-red-200`;
export const inputRO = `${inputBase} bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed select-none `;

/* ── Field — label + hint + fixed-height error slot ─────────────────── */
export function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide leading-none">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </span>
        {hint && (
          <span className="text-[10px] text-gray-400 normal-case font-normal">
            {hint}
          </span>
        )}
      </div>
      {children}
      {/* fixed 16px slot so rows don't shift when errors appear */}
      <div className="h-4 mt-0.5">
        {error && (
          <p className="text-[10px] text-red-500 font-medium leading-none">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── TInput ───────────────────────────────────────────────────────── */
export function TInput({
  value,
  onChange,
  type = "text",
  readOnly,
  min,
  max,
  step,
  hasError,
}) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      readOnly={readOnly}
      min={min}
      max={type === "date" ? todayStr() : max}
      step={step}
      className={readOnly ? inputRO : hasError ? inputError : inputNormal}
    />
  );
}

/* ── TSelect ──────────────────────────────────────────────────────── */
export function TSelect({ value, onChange, hasError, children }) {
  return (
    <select
      value={value ?? ""}
      onChange={onChange}
      className={hasError ? inputError : inputNormal}
    >
      {children}
    </select>
  );
}

/* ── SectionHead — modal header, title derived from entityName/edit ─── */
export function SectionHead({ entityName, edit, close }) {
  const [bar, txt, bdr] = (edit
    ? "bg-amber-500 text-amber-700 border-amber-100"
    : "bg-emerald-600 text-emerald-700 border-emerald-100"
  ).split(" ");
  return (
    <div
      className={`flex items-center justify-between gap-2.5 px-4 mb-3 pb-2.5 border-b ${bdr}`}
    >
      <div className="flex items-center gap-4">
        <span className={`w-1.5 h-10 ${bar} rounded-full flex-shrink-0`} />
        <div className="">
          <h3 className={` font-black ${txt} uppercase tracking-widest`}>
            {edit ? `Edit ${entityName}` : `Add ${entityName}`}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{entityName} Input</p>
        </div>
      </div>

      <button
        onClick={close}
        className="cursor-pointer w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
      >
        <HiXMark className="text-xl" />
      </button>
    </div>
  );
}
