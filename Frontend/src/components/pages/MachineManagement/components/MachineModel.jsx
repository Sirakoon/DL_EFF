import { useEffect, useState, useCallback, useMemo } from "react";
import {
  HiXMark,
  HiCheck,
  HiExclamationCircle,
  HiLockClosed,
} from "react-icons/hi2";
import { TbLoader2 } from "react-icons/tb";
import { createMachines, updateMachines } from "../../../../services/api";
import { toast } from "../../../../lib/toast";
import { todayStr } from "../../../../utils/date";

const getEmptyForm = () => ({
  machine_code: "",
  oee_target: "",
  version: "",
  is_active: 1,
});

/* ── primitives ─────────────────────────────────────────────────── */
function Field({ label, required, hint, error, children }) {
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

const inputBase =
  "w-full h-10 border rounded-xl px-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400";
const inputNormal = `${inputBase} bg-white text-gray-800 border-gray-200 hover:border-gray-300`;
const inputError = `${inputBase} bg-white text-gray-800 border-red-300 ring-2 ring-red-200`;
const inputRO = `${inputBase} bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed select-none`;

function TInput({
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


const SECTION_COLOR_SCHEME = {
  blue: "bg-blue-600 text-blue-700 border-blue-100",
  teal: "bg-teal-600 text-teal-700 border-teal-100",
  emerald: "bg-emerald-600 text-emerald-700 border-emerald-100",
  amber: "bg-amber-500 text-amber-700 border-amber-100",
};

function SectionHead({ color, edit, close }) {
  const [bar, txt, bdr] = SECTION_COLOR_SCHEME[color].split(" ");
  return (
    <div
      className={`flex items-center justify-between gap-2.5 px-4 mb-3 pb-2.5 border-b ${bdr}`}
    >
      <div className="flex items-center gap-4">
        <span className={`w-1.5 h-10 ${bar} rounded-full flex-shrink-0`} />
        <div className="">
          <h3 className={` font-black ${txt} uppercase tracking-widest`}>
            {edit ? "Edit Machine" : "Add Machine"}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Machine Input</p>
        </div>
      </div>

      <button
        onClick={close}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
      >
        <HiXMark className="text-xl" />
      </button>
    </div>
  );
}

function SubLabel({ children }) {
  return (
    <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function MachineModal({ mode, initialData, onClose, onSaved }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState(getEmptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && initialData) {
      setForm({
        machine_code: initialData.machine_code ?? "",
        oee_target: initialData.oee_target ?? "",
        version: initialData.version ?? "",
        is_active: initialData.is_active ?? 1,
      });
    }
  }, [isEdit, initialData]);

  const set = useCallback(
    (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value })),
    [],
  );

  const validate = () => {
    const e = {};
    ["machine_code", "oee_target", "version", "is_active"].forEach((k) => {
      if (form[k] === "" || form[k] == null) e[k] = "Required";
    });
    const rng = (k, lo, hi) => {
      const n = Number(form[k]);
      if (form[k] !== "" && (n < lo || n > hi)) e[k] = `${lo}–${hi}`;
    };
    rng("machine_code", 0);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.product_group;
      if (isEdit) await updateMachines(initialData.record_id, payload);
      else await createMachines(payload);
      toast.success(
        isEdit ? "Record updated successfully" : "Record created successfully",
      );
      onSaved();
    } catch (err) {
      toast.error(err.message);
      setErrors({ _server: err.message });
    } finally {
      setSaving(false);
    }
  };

  const hasFieldErrors = Object.keys(errors).some((k) => k !== "_server");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100 flex-shrink-0"></div>
        <SectionHead
          label="Edit Machine"
          color={isEdit ? "emerald" : "amber"}
          edit={isEdit}
          close={onClose}
        />

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="space-y-5">
            {/* Production Data */}
            <div>
              <div className="grid gap-x-4 gap-y-0">
                <Field
                  label="Machine Code"
                  required
                  //   hint="hr · 0–24"
                  error={errors.machine_code}
                >
                  <TInput
                    type="text"
                    value={form.machine_code}
                    onChange={set("machine_code")}
                    // step="0.1"
                    // min={0}
                    // max={24}
                    hasError={!!errors.machine_code}
                  />
                </Field>
                <Field
                  label="OEE Target"
                  required
                  //   hint="≥ 0"
                  error={errors.oee_target}
                >
                  <TInput
                    type="number"
                    value={form.oee_target}
                    onChange={set("oee_target")}
                    step="0.001"
                    min={0}
                    max={1}
                    hasError={!!errors.oee_target}
                  />
                </Field>
                <Field
                  label="Version"
                  required
                  //   hint="≥ 0"
                //   error={errors.version}
                >
                  <TInput
                    type="text"
                    value={form.version}
                    onChange={set("version")}
                    // hasError={!!errors.version}
                  />
                </Field>
                {/* <Field
                  label="Ac"
                  required
                  hint="integer"
                  error={errors.is_active}
                >
                  <button className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-green-100 text-green-700">Active</button>
                  <button className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500">Not Active</button>
                  <TInput
                    type="number"
                    value={form.is_active}
                    onChange={set("is_active")}
                    step="1"
                    min={0}
                    hasError={!!errors.is_active}
                  />
                </Field> */}
              </div>
            </div>
          </div>

          {/* server error */}
          {errors._server && (
            <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <HiExclamationCircle className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
              {errors._server}
            </div>
          )}
          {hasFieldErrors && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-600 font-medium">
              <HiExclamationCircle className="text-red-400" />
              Please fill in all required fields and fix any errors
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-60 transition-all shadow-md shadow-blue-200 cursor-pointer"
          >
            {saving ? (
              <>
                <TbLoader2 className="animate-spin text-sm" /> Saving...
              </>
            ) : (
              <>
                <HiCheck className="text-sm" />{" "}
                {isEdit ? "Save Changes" : "Add Record"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
