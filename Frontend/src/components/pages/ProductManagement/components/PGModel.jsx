import { useEffect, useState, useCallback } from "react";
import { HiXMark, HiCheck, HiExclamationCircle } from "react-icons/hi2";
import { TbLoader2 } from "react-icons/tb";
import {  createProductGroup, updateProductGroup } from "../../../../services/api";
import { toast } from "../../../../lib/toast";

const getEmptyForm = () => ({
  product_group_name: "",
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
  "w-full h-10 border-2 border-gray-300 rounded-xl px-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400";
const inputNormal = `${inputBase} bg-white text-gray-800 border-gray-200 hover:border-gray-300`;
const inputError = `${inputBase} bg-white text-gray-800 border-red-300 ring-2 ring-red-200`;

function TInput({ value, onChange, type = "text", min, max, step, hasError }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      className={hasError ? inputError : inputNormal}
    />
  );
}

function SectionHead({ edit, close }) {
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
            {edit ? "Edit Product Group" : "Add Product Group"}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Product Group Input</p>
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

/* ══════════════════════════════════════════════════════════════════ */
export default function ProductGroupModal({ mode, initialData, onClose, onSaved }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState(getEmptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});


  useEffect(() => {
    if (isEdit && initialData) {
      setForm({
        product_group_name: initialData.product_group_name ?? ""
      });
    }
  }, [isEdit, initialData]);

  const set = useCallback(
    (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value })),
    [],
  );

  const validate = () => {
    const e = {};
    ["product_group_name"].forEach((k) => {
      if (form[k] === "" || form[k] == null) e[k] = "Required";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (isEdit) await updateProductGroup(initialData.product_group_id, payload);
      else await createProductGroup(payload);
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
        <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100 flex-shrink-0"></div>
        <SectionHead edit={isEdit} close={onClose} />

        <div className="overflow-y-auto flex-1 px-6 py-5 ">
          <div className="space-y-5">
            <div>
              <div className="">
                <Field
                  label="Product Gruop Name"
                  required
                  error={errors.product_group_name}
                >
                  <TInput
                    type="text"
                    value={form.product_group_name}
                    onChange={set("product_group_name")}
                    hasError={!!errors.product_group_name}
                  />
                </Field>
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
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0 z-0">
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
                <HiCheck className="text-sm" />
                {isEdit ? "Save Changes" : "Add Record"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
