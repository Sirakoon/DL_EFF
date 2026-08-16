import { useEffect, useState, useCallback } from "react";
import { HiCheck, HiExclamationCircle } from "react-icons/hi2";
import { TbLoader2 } from "react-icons/tb";
import {
  createMachines,
  updateMachines,
  getAllProductGroups,
} from "../../../../services/api";
import { toast } from "../../../../lib/toast";
import { Field, TInput, SectionHead } from "../../../shared/FormKit";

const getEmptyForm = () => ({
  machine_code: "",
  oee_target: "",
  version: "",
  is_active: 1,
  product_group: [],
});

const isSameProductGroup = (a, b) => a.product_group_id === b.product_group_id;

/* ── Popup ─────────────────────────────────────────────────── */
function PopupProductGroup({
  isOpen,
  onClose,
  optionsList,
  selectedItems,
  onSelect,
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/50 px-4 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-800">
            Select Product Group
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer hover:bg-red-200 rounded-full p-1"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/*ฺ Body */}
        <div className="max-h-[50vh] overflow-y-auto px-2 py-2">
          {optionsList.map((option, index) => {
            const isSelected = (selectedItems || []).some((item) =>
              isSameProductGroup(item, option),
            );
            return (
              <label
                key={index}
                className="flex cursor-pointer items-center justify-between rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <span
                  className={`text-sm ${isSelected ? "font-semibold text-blue-700" : "text-gray-700"}`}
                >
                  {option.product_group_name}
                </span>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded border ${isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"}`}
                >
                  {isSelected && (
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isSelected}
                  onChange={() => onSelect(option)}
                />
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════ */
export default function MachineModal({ mode, initialData, onClose, onSaved }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState(getEmptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [productGroups, setProductGroups] = useState([]);

  // const productGroupList = ["Machine A", "Machine B", "Machine C", "Machine D"];

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    if (isEdit && initialData) {
      setForm({
        machine_code: initialData.machine_code ?? "",
        oee_target: initialData.oee_target ?? "",
        version: initialData.version ?? "",
        product_group: initialData.product_group ?? [],
        is_active: initialData.is_active ?? 1,
      });
    }
  }, [isEdit, initialData]);


  useEffect(() => {
    getAllProductGroups()
      .then((res) => setProductGroups(res.data))
      .catch((e) => toast.error(`Failed to load product groups: ${e.message}`));
  }, []);

  const set = useCallback(
    (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value })),
    [],
  );

  const validate = () => {
    const e = {};
    ["machine_code", "oee_target", "is_active"].forEach((k) => {
      if (form[k] === "" || form[k] == null) e[k] = "Required";
    });
    const rng = (k, lo, hi) => {
      const n = Number(form[k]);
      if (form[k] !== "" && (n < lo || n > hi)) e[k] = `${lo}–${hi}`;
    };
    rng("machine_code", 0);
    rng("oee_target", 0, 1);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSelect = (option) => {
    setForm((prev) => {
      const currentSelected = prev.product_group || [];
      const isSelected = currentSelected.some((item) =>
        isSameProductGroup(item, option),
      );
      if (isSelected) {
        return {
          ...prev,
          product_group: currentSelected.filter(
            (item) => !isSameProductGroup(item, option),
          ),
        };
      }
      return {
        ...prev,
        product_group: [...currentSelected, option],
      };
    });
  };

  const handleRemove = (optionToRemove) => {
    setForm((prev) => ({
      ...prev,
      product_group: prev.product_group.filter(
        (item) => !isSameProductGroup(item, optionToRemove),
      ),
    }));
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (isEdit) await updateMachines(initialData.machine_id, payload);
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
        <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100 flex-shrink-0"></div>
        <SectionHead entityName="Machine" edit={isEdit} close={onClose} />

        <div className="overflow-y-auto flex-1 px-6 py-5 ">
          <div className="space-y-5">
            <div>
              <div className="grid gap-x-4 gap-y-0">
                <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                  <Field
                    label="Machine Code"
                    required
                    error={errors.machine_code}
                  >
                    <TInput
                      type="text"
                      value={form.machine_code}
                      onChange={set("machine_code")}
                      hasError={!!errors.machine_code}
                    />
                  </Field>
                  <Field label="OEE Target" required error={errors.oee_target}>
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
                  <Field label="Version">
                    <TInput
                      type="number"
                      value={form.version}
                      onChange={set("version")}
                      hasError={!!errors.version}
                    />
                  </Field>
                  <Field label="Custom Multi-Select" required>
                    <button
                      type="button"
                      onClick={() => setIsPopupOpen(true)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-xl border-2 border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-blue-200 hover:text-blue-900 hover:bg-blue-200 focus:border-blue-500 focus:outline-none"
                    >
                      <span
                        className={
                          form.product_group?.length > 0
                            ? "text-gray-800 font-medium"
                            : "text-gray-500"
                        }
                      >
                        {form.product_group?.length > 0
                          ? `Selected ${
                              form.product_group.length
                            } Product Group`
                          : "Click to select Product Group..."}
                      </span>
                      <svg
                        className="h-4 w-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                    {isPopupOpen && (
                      <PopupProductGroup
                        isOpen={isPopupOpen}
                        onClose={() => setIsPopupOpen(false)}
                        optionsList={productGroups}
                        selectedItems={form.product_group}
                        onSelect={handleSelect}
                      />
                    )}
                  </Field>
                </div>

                {form.product_group && form.product_group.length > 0 && (
                  <div className={`${isEdit ?"mb-3":""} flex flex-wrap gap-2`}>
                    {form.product_group.map((item, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[13px] font-medium text-blue-700 shadow-sm"
                      >
                        {item.product_group_name}
                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          className="ml-1 flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-200 text-blue-500 hover:text-blue-800 focus:outline-none transition-colors cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {isEdit ? (
                  <Field label="Status" required error={errors.is_active}>
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            is_active: Number(prev.is_active) === 1 ? 0 : 1,
                          }))
                        }
                        className={` relative h-6 w-16 rounded-full transition-all duration-800 cursor-pointer
                                  ${Number(form.is_active) === 1 ? "bg-teal-500" : "bg-gray-300"}
                                `}
                      >
                        <span
                          className={`absolute inset-0 flex items-center text-sm font-bold tracking-wider text-white
                                    ${Number(form.is_active) === 1 ? "justify-start pl-2" : "justify-end pr-2"}
                                  `}
                        >
                          {Number(form.is_active) === 1 ? "ON" : "OFF"}
                        </span>
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all duration-1000 ${Number(form.is_active) === 1 ? "left-11" : "left-1"}`}
                        />
                      </button>
                      <span className="text-[14px] font-bold transition-all duration-500 text-gray-600">
                        {form.is_active == 1 ? "Active " : "Disable"}
                      </span>
                    </div>
                  </Field>
                ) : (
                  <></>
                )}
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
