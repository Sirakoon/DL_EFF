import { useEffect, useState, useCallback } from "react";
import { HiCheck, HiExclamationCircle } from "react-icons/hi2";
import { TbLoader2 } from "react-icons/tb";
import {
  createProduct,
  updateProduct,
  getAllProductGroups,
} from "../../../../services/api";
import { toast } from "../../../../lib/toast";
import { Field, TInput, TSelect, SectionHead } from "../../../shared/FormKit";

const getEmptyForm = () => ({
  product_code: "",
  product_group_id: "",
  product_description: "",
  capacity_pcs_hr: "",
  mc_speed_pcs_hr: "",
  is_active: 1,
});

/* ══════════════════════════════════════════════════════════════════ */
export default function ProductModal({ mode, initialData, onClose, onSaved }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState(getEmptyForm);
  const [groups, setGroups] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getAllProductGroups()
      .then((res) => setGroups(res.data))
      .catch((e) => toast.error(`Failed to load product groups: ${e.message}`));
  }, []);

  useEffect(() => {
    if (isEdit && initialData) {
      setForm({
        product_code: initialData.product_code ?? "",
        product_group_id: initialData.product_group_id ?? "",
        product_description: initialData.product_description ?? "",
        capacity_pcs_hr: initialData.capacity_pcs_hr ?? "",
        mc_speed_pcs_hr: initialData.mc_speed_pcs_hr ?? "",
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
    ["product_code", "product_group_id"].forEach((k) => {
      if (form[k] === "" || form[k] == null) e[k] = "Required";
    });
    const rng = (k, lo) => {
      if (form[k] === "" || form[k] == null) return;
      const n = Number(form[k]);
      if (isNaN(n) || n < lo) e[k] = `must be ≥ ${lo}`;
    };
    rng("capacity_pcs_hr", 0);
    rng("mc_speed_pcs_hr", 0);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      if (isEdit) await updateProduct(initialData.product_id, payload);
      else await createProduct(payload);
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
    >
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100 flex-shrink-0"></div>
        <SectionHead entityName="Product" edit={isEdit} close={onClose} />

        <div className="overflow-y-auto flex-1 px-6 py-5 ">
          <div className="space-y-5">
            <div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                <Field
                  label="Product Code"
                  required
                  error={errors.product_code}
                >
                  <TInput
                    type="text"
                    value={form.product_code}
                    onChange={set("product_code")}
                    hasError={!!errors.product_code}
                  />
                </Field>
                <Field
                  label="Product Group"
                  required
                  error={errors.product_group_id}
                >
                  <TSelect
                    value={form.product_group_id}
                    onChange={set("product_group_id")}
                    hasError={!!errors.product_group_id}
                  >
                    <option value="">Select Product Group</option>
                    {groups.map((g) => (
                      <option
                        key={g.product_group_id}
                        value={g.product_group_id}
                      >
                        {g.product_group_name}
                      </option>
                    ))}
                  </TSelect>
                </Field>
                <div className="col-span-2">
                  <Field label="Description">
                    <TInput
                      type="text"
                      value={form.product_description}
                      onChange={set("product_description")}
                    />
                  </Field>
                </div>
                <Field
                  label="Capacity"
                  hint="Pcs/man-hr · Manual machine"
                  error={errors.capacity_pcs_hr}
                >
                  <TInput
                    type="number"
                    value={form.capacity_pcs_hr}
                    onChange={set("capacity_pcs_hr")}
                    step="0.01"
                    min={0}
                    hasError={!!errors.capacity_pcs_hr}
                  />
                </Field>
                <Field
                  label="MC Speed"
                  hint="Pcs/hr · Auto machine"
                  error={errors.mc_speed_pcs_hr}
                >
                  <TInput
                    type="number"
                    value={form.mc_speed_pcs_hr}
                    onChange={set("mc_speed_pcs_hr")}
                    step="0.01"
                    min={0}
                    hasError={!!errors.mc_speed_pcs_hr}
                  />
                </Field>
                {isEdit && (
                  <div className="col-span-2">
                    <Field label="Status" required>
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
                  </div>
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
