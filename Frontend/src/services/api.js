const BASE_URL = 'http://localhost:3000/api';

/* ── core fetch ─────────────────────────────────────────────────── */
async function fetchJSON(path, options) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

function qs(params = {}) {
  const s = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return s ? '?' + s : '';
}

/* ── Machine Performance (existing dashboard) ───────────────────── */
export const getMachinePerformance = (p = {}) => fetchJSON(`/dashboard/machine-performance${qs(p)}`);
export const getFilterOptions = () => fetchJSON('/dashboard/filters');

/* ── DL Efficiency ──────────────────────────────────────────────── */
export const getDlEffOverview = (p = {}) => fetchJSON(`/dl-eff/overview${qs(p)}`);
export const getDlEffDetail = (p = {}) => fetchJSON(`/dl-eff/detail${qs(p)}`);
export const getDlEffFilters = () => fetchJSON('/dl-eff/filters');

/* ── PD Input — list & filters ──────────────────────────────────── */
export const getPdInputList = (p = {}) => fetchJSON(`/pd-input${qs(p)}`);
export const getPdInputFilters = () => fetchJSON('/pd-input/filters');

/* ── PD Input — master dropdowns ───────────────────────────────── */
export const getMasterMachines = () => fetchJSON('/pd-input/master/machines');
export const getMasterProducts = () => fetchJSON('/pd-input/master/products');
export const getMasterShifts = () => fetchJSON('/pd-input/master/shifts');

/* ── PD Input — CRUD ────────────────────────────────────────────── */
export const createPdInput = (body) => fetchJSON('/pd-input', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const updatePdInput = (id, body) => fetchJSON(`/pd-input/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const deletePdInput = (id) => fetchJSON(`/pd-input/${id}`, { method: 'DELETE' });
