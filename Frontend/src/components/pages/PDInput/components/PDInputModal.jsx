import { useEffect, useState, useCallback, useMemo } from 'react';
import { HiXMark, HiCheck, HiExclamationCircle, HiLockClosed } from 'react-icons/hi2';
import { TbLoader2 } from 'react-icons/tb';
import {
  getMasterMachines, getMasterProducts, getMasterMachineProductGroups, getMasterShifts,
  createPdInput, updatePdInput,
} from '../../../../services/api';
import { toast } from '../../../../lib/toast';
import { todayStr } from '../../../../utils/date';

const getEmptyForm = () => ({
  production_date: todayStr(), shift_code: '', machine_code: '', product_group: '',
  product_code: '', machine_run_time: '', std_hc: '', std_hour: '',
  hour_piece_rate: '', actual_output: '', loss_hour: '', actual_hc: '',
  actual_bulk_hr: '0', actual_pallet_hr: '0', actual_assist_hr: '0',
});

/* ── primitives ─────────────────────────────────────────────────── */
function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide leading-none">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </span>
        {hint && <span className="text-[10px] text-gray-400 normal-case font-normal">{hint}</span>}
      </div>
      {children}
      {/* fixed 16px slot so rows don't shift when errors appear */}
      <div className="h-4 mt-0.5">
        {error && <p className="text-[10px] text-red-500 font-medium leading-none">{error}</p>}
      </div>
    </div>
  );
}

const inputBase = 'w-full h-10 border rounded-xl px-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400';
const inputNormal = `${inputBase} bg-white text-gray-800 border-gray-200 hover:border-gray-300`;
const inputError = `${inputBase} bg-white text-gray-800 border-red-300 ring-2 ring-red-200`;
const inputRO = `${inputBase} bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed select-none`;

function TInput({ value, onChange, type = 'text', readOnly, min, max, step, hasError }) {
  return (
    <input
      type={type} value={value ?? ''} onChange={onChange}
      readOnly={readOnly} min={min} max={type === 'date' ? todayStr() : max} step={step}
      className={readOnly ? inputRO : hasError ? inputError : inputNormal}
    />
  );
}

function TSelect({ value, onChange, disabled, hasError, children }) {
  return (
    <select
      value={value ?? ''} onChange={onChange} disabled={disabled}
      className={`${disabled ? inputRO : hasError ? inputError : inputNormal} appearance-auto cursor-pointer`}
    >
      {children}
    </select>
  );
}

function AutoTag({ label, value }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 h-10">
      <HiLockClosed className="text-slate-300 text-xs flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[9px] text-slate-400 font-bold uppercase leading-none tracking-wide">{label}</div>
        <div className="text-sm font-semibold text-slate-600 leading-tight truncate mt-0.5">{value ?? '—'}</div>
      </div>
    </div>
  );
}

const SECTION_COLOR_SCHEME = {
  blue: 'bg-blue-600 text-blue-700 border-blue-100',
  teal: 'bg-teal-600 text-teal-700 border-teal-100',
  emerald: 'bg-emerald-600 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-500 text-amber-700 border-amber-100',
};

function SectionHead({ label, color }) {
  const [bar, txt, bdr] = SECTION_COLOR_SCHEME[color].split(' ');
  return (
    <div className={`flex items-center gap-2.5 mb-3 pb-2.5 border-b ${bdr}`}>
      <span className={`w-1.5 h-4 ${bar} rounded-full flex-shrink-0`} />
      <span className={`text-[11px] font-black ${txt} uppercase tracking-widest`}>{label}</span>
    </div>
  );
}

function SubLabel({ children }) {
  return <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">{children}</div>;
}

/* ══════════════════════════════════════════════════════════════════ */
export default function PDInputModal({ mode, initialData, onClose, onSaved }) {
  const isEdit = mode === 'edit';

  const [form, setForm] = useState(getEmptyForm);
  const [machines, setMachines] = useState([]);
  const [products, setProducts] = useState([]);
  const [machineProductGroups, setMachineProductGroups] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [checkMachine, setCheckMachine] = useState(null);

  const selectedMachine = machines.find((m) => m.machine_code === form.machine_code);
  const selectedProduct = products.find((p) => p.product_code === form.product_code);

  const allProductGroups = useMemo(() =>
    [...new Set(products.map((p) => p.product_group_name))].sort()
    , [products]);

  // machine_code -> Set(product_group_name), built from records saved so far
  const groupsByMachine = useMemo(() => {
    const map = new Map();
    machineProductGroups.forEach(({ machine_code, product_group_name }) => {
      if (!map.has(machine_code)) map.set(machine_code, new Set());
      map.get(machine_code).add(product_group_name);
    });
    return map;
  }, [machineProductGroups]);

 

  // groups known for the selected machine; null/empty means "not learned yet" — fall back to showing all
  const machineGroups = form.machine_code ? groupsByMachine.get(form.machine_code) : null;

  // const productGroups = useMemo(() => (
  //   machineGroups && machineGroups.size > 0
  //     ? allProductGroups.filter((g) => machineGroups.has(g))
  //     : allProductGroups
  // ), [allProductGroups, machineGroups])

  const productGroups = useMemo(() => {
  if (!checkMachine) {
    return [];
  }
  return Array.from(groupsByMachine.get(checkMachine) || []);
}, [checkMachine, groupsByMachine]);
  
  
  const filteredProducts = useMemo(() =>
    form.product_group ? products.filter((p) => p.product_group_name === form.product_group) : []
  , [products, form.product_group]);

  useEffect(() => {
    Promise.all([getMasterMachines(), getMasterProducts(), getMasterShifts(), getMasterMachineProductGroups()])
      .then(([m, p, s, mpg]) => {
        setMachines(m.data ?? []);
        setProducts(p.data ?? []);
        setShifts(s.data ?? []);
        setMachineProductGroups(mpg.data ?? []);
      })
      .catch((e) => toast.error(`Failed to load master data: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isEdit && initialData && !loading) {
      setForm({
        production_date: initialData.production_date?.slice(0, 10) ?? '',
        shift_code: initialData.shift_code ?? '',
        machine_code: initialData.machine_code ?? '',
        product_group: initialData.product_group_name ?? '',
        product_code: initialData.product_code ?? '',
        machine_run_time: initialData.machine_run_time ?? '',
        std_hc: initialData.std_hc ?? '',
        std_hour: initialData.std_hour ?? '',
        hour_piece_rate: initialData.hour_piece_rate ?? '',
        actual_output: initialData.actual_output ?? '',
        loss_hour: initialData.loss_hour ?? '',
        actual_hc: initialData.actual_hc ?? '',
        actual_bulk_hr: initialData.actual_bulk_hr ?? '0',
        actual_pallet_hr: initialData.actual_pallet_hr ?? '0',
        actual_assist_hr: initialData.actual_assist_hr ?? '0',
      });
    }
  }, [isEdit, initialData, loading]);

  const set = useCallback((k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value })), []);
  const handleGroupChange = (e) => setForm((f) => ({ ...f, product_group: e.target.value, product_code: '' }));

  const handleMachineChange = (e) => {
    const machine_code = e.target.value;
    const groups = machine_code ? groupsByMachine.get(machine_code) : null;
    const groupStillValid = !groups || groups.size === 0 || groups.has(form.product_group);
    setCheckMachine(machine_code)
    setForm((f) => (
      groupStillValid
        ? { ...f, machine_code }
        : { ...f, machine_code, product_group: '', product_code: '' }
    ));
  };

  const validate = () => {
    const e = {};
    ['production_date', 'shift_code', 'machine_code', 'product_group', 'product_code',
      'machine_run_time', 'std_hc', 'std_hour', 'hour_piece_rate', 'actual_output', 'actual_hc', 'loss_hour']
      .forEach((k) => { if (form[k] === '' || form[k] == null) e[k] = 'Required'; });
    const rng = (k, lo, hi) => { const n = Number(form[k]); if (form[k] !== '' && (n < lo || n > hi)) e[k] = `${lo}–${hi}`; };
    rng('machine_run_time', 0, 24); rng('std_hc', 0, 25); rng('std_hour', 0, 99);
    rng('loss_hour', 0, 13); rng('actual_bulk_hr', 0, 13); rng('actual_pallet_hr', 0, 13);
    rng('actual_assist_hr', 0, 13); rng('actual_hc', 0, 25);
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.product_group;
      if (isEdit) await updatePdInput(initialData.record_id, payload);
      else await createPdInput(payload);
      toast.success(isEdit ? 'Record updated successfully' : 'Record created successfully');
      onSaved();
    } catch (err) {
      toast.error(err.message);
      setErrors({ _server: err.message });
    } finally {
      setSaving(false);
    }
  };

  const hasFieldErrors = Object.keys(errors).some((k) => k !== '_server');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-black text-gray-900">
              {isEdit ? 'Edit Production Record' : 'Add Production Record'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Production Data Input</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition">
            <HiXMark className="text-xl" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <TbLoader2 className="text-2xl text-blue-500 animate-spin" />
              <span className="text-sm text-gray-400">Loading master data...</span>
            </div>
          ) : (
            <div className="space-y-5">

              {/* Basic Info */}
              <div>
                <SectionHead label="Basic Info" color="blue" />
                <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                  {/* row 1 */}
                  <Field label="Production Date" required error={errors.production_date}>
                    <TInput type="date" value={form.production_date} onChange={set('production_date')} hasError={!!errors.production_date} />
                  </Field>
                  <Field label="Shift" required error={errors.shift_code}>
                    <TSelect value={form.shift_code} onChange={set('shift_code')} hasError={!!errors.shift_code}>
                      <option value="">Select Shift</option>
                      {shifts.map((s) => <option key={s.shift_code} value={s.shift_code}>{s.shift_code}</option>)}
                    </TSelect>
                  </Field>
                  {/* row 2 */}
                  <Field label="Machine" required error={errors.machine_code}>
                    <TSelect value={form.machine_code} onChange={handleMachineChange} hasError={!!errors.machine_code}>
                      <option value="">Select Machine</option>
                      {machines.map((m) => <option key={m.machine_code} value={m.machine_code}>{m.machine_code}</option>)}
                    </TSelect>
                  </Field>
                  <div className="flex flex-col justify-end pb-4">
                    <SubLabel>OEE Target</SubLabel>
                    <AutoTag label="Auto — from machine" value={selectedMachine?.oee_target != null ? `${(selectedMachine.oee_target * 100).toFixed(1)}%` : '—'} />
                  </div>
                </div>
              </div>

              {/* Product */}
              <div>
                <SectionHead label="Product" color="teal" />
                <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                  {/* row 1 */}
                  <Field
                    label="Product Group" required error={errors.product_group}
                    hint={machineGroups && machineGroups.size > 0 ? '· filtered by machine' : ''}
                  >
                    <TSelect value={form.product_group} disabled={!form.machine_code} onChange={handleGroupChange} hasError={!!errors.product_group}>
                      <option value="">Select Product Group</option>
                      {productGroups.map((g) => <option key={g} value={g}>{g}</option>)}
                    </TSelect>
                  </Field>
                  <Field label="Product Code" required hint={!form.product_group ? '· select group first' : ''} error={errors.product_code}>
                    <TSelect value={form.product_code} onChange={set('product_code')} disabled={!form.product_group} hasError={!!errors.product_code}>
                      <option value="">Select Product Code</option>
                      {filteredProducts.map((p) => <option key={p.product_code} value={p.product_code}>{p.product_code}</option>)}
                    </TSelect>
                  </Field>
                  {/* row 2 — auto-fill tags, always rendered */}
                  <div className="flex flex-col justify-end pb-4">
                    <SubLabel>Description</SubLabel>
                    <AutoTag label="Auto — from product" value={selectedProduct?.product_description} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pb-4">
                    <div>
                      <SubLabel>MC Speed</SubLabel>
                      <AutoTag label="Pcs / min" value={selectedProduct?.mc_speed_pcs_hr} />
                    </div>
                    <div>
                      <SubLabel>Capacity</SubLabel>
                      <AutoTag label="Pcs / hr" value={selectedProduct?.capacity_pcs_hr} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Production Data */}
              <div>
                <SectionHead label="Production Data" color="emerald" />
                <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                  <Field label="Machine Run Time" required hint="hr · 0–24" error={errors.machine_run_time}>
                    <TInput type="number" value={form.machine_run_time} onChange={set('machine_run_time')} step="0.1" min={0} max={24} hasError={!!errors.machine_run_time} />
                  </Field>
                  <Field label="STD HC" required hint="0–25" error={errors.std_hc}>
                    <TInput type="number" value={form.std_hc} onChange={set('std_hc')} step="0.01" min={0} max={25} hasError={!!errors.std_hc} />
                  </Field>
                  <Field label="STD Hour" required hint="≥ 0" error={errors.std_hour}>
                    <TInput type="number" value={form.std_hour} onChange={set('std_hour')} step="0.01" min={0} hasError={!!errors.std_hour} />
                  </Field>
                  <Field label="Hour Piece Rate" required hint="≥ 0" error={errors.hour_piece_rate}>
                    <TInput type="number" value={form.hour_piece_rate} onChange={set('hour_piece_rate')} step="0.01" min={0} hasError={!!errors.hour_piece_rate} />
                  </Field>
                  <Field label="Actual Output" required hint="integer" error={errors.actual_output}>
                    <TInput type="number" value={form.actual_output} onChange={set('actual_output')} step="1" min={0} hasError={!!errors.actual_output} />
                  </Field>
                  <Field label="Actual HC" required hint="0–25" error={errors.actual_hc}>
                    <TInput type="number" value={form.actual_hc} onChange={set('actual_hc')} step="0.01" min={0} max={25} hasError={!!errors.actual_hc} />
                  </Field>
                </div>
              </div>

              {/* Loss Hours */}
              <div>
                <SectionHead label="Loss Hours" color="amber" />
                <div className="grid grid-cols-2 gap-x-4 gap-y-0">
                  <Field label="Loss Hour" required hint="≥ 0" error={errors.loss_hour}>
                    <TInput type="number" value={form.loss_hour} onChange={set('loss_hour')} step="0.01" min={0} max={13} hasError={!!errors.loss_hour} />
                  </Field>
                  <Field label="Bulk (Hr)" hint="0–13" error={errors.actual_bulk_hr}>
                    <TInput type="number" value={form.actual_bulk_hr} onChange={set('actual_bulk_hr')} step="0.01" min={0} max={13} hasError={!!errors.actual_bulk_hr} />
                  </Field>
                  <Field label="Pallet (Hr)" hint="0–13" error={errors.actual_pallet_hr}>
                    <TInput type="number" value={form.actual_pallet_hr} onChange={set('actual_pallet_hr')} step="0.01" min={0} max={13} hasError={!!errors.actual_pallet_hr} />
                  </Field>
                  <Field label="Assist (Hr)" hint="0–13" error={errors.actual_assist_hr}>
                    <TInput type="number" value={form.actual_assist_hr} onChange={set('actual_assist_hr')} step="0.01" min={0} max={13} hasError={!!errors.actual_assist_hr} />
                  </Field>
                </div>
              </div>

            </div>
          )}

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
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-60 transition-all shadow-md shadow-blue-200 cursor-pointer"
          >
            {saving
              ? <><TbLoader2 className="animate-spin text-sm" /> Saving...</>
              : <><HiCheck className="text-sm" /> {isEdit ? 'Save Changes' : 'Add Record'}</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}
