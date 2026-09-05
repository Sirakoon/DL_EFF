import { todayStr } from '../utils/date';

// Relative by default: the production build is served by the backend from
// the same origin, so plain "/api" works regardless of hostname/IP. Set
// VITE_API_URL only for local dev against a backend on a different host/port.
export const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const AUTH_TOKEN_KEY = 'rtu_auth_token';
export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
export const setAuthToken = (token) => {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
};

/* ── core fetch ─────────────────────────────────────────────────── */
async function fetchJSON(path, options = {}) {
  const token = getAuthToken();
  const headers = { ...options.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
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
export const getMasterMachineProductGroups = () => fetchJSON('/pd-input/master/machine-product-groups');
export const getMasterShifts = () => fetchJSON('/pd-input/master/shifts');

/* ── PD Input — CRUD ────────────────────────────────────────────── */
export const createPdInput = (body) => fetchJSON('/pd-input', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const updatePdInput = (id, body) => fetchJSON(`/pd-input/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const deletePdInput = (id) => fetchJSON(`/pd-input/${id}`, { method: 'DELETE' });

/* ── Machines — CRUD ────────────────────────────────────────────── */
export const getMachines = () => fetchJSON('/machine');
export const createMachines = (body) => fetchJSON('/machine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const updateMachines = (id, body) => fetchJSON(`/machine/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const deleteMachines = (id) => fetchJSON(`/machine/${id}`, { method: 'DELETE' });

/* ── Products — CRUD ────────────────────────────────────────────── */
export const getProducts = () => fetchJSON('/product');
export const createProduct = (body) => fetchJSON('/product', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const updateProduct = (id, body) => fetchJSON(`/product/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const deleteProduct = (id) => fetchJSON(`/product/${id}`, { method: 'DELETE' });

/* ── Product Groups — CRUD ──────────────────────────────────────── */
export const getAllProductGroups = () => fetchJSON('/productgroup');
export const getProductGroupById = (id) => fetchJSON(`/productgroup/${id}`);
export const createProductGroup = (body) => fetchJSON('/productgroup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const updateProductGroup = (id, body) => fetchJSON(`/productgroup/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const deleteProductGroup = (id) => fetchJSON(`/productgroup/${id}`, { method: 'DELETE' });

/* ── Auth ───────────────────────────────────────────────────────── */
export const authRegister = (body) => fetchJSON('/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const authLogin = (body) => fetchJSON('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const authMe = () => fetchJSON('/auth/me');
export const authListUsers = (status) => fetchJSON(`/auth/users${qs({ status })}`);
export const authApproveUser = (id) => fetchJSON(`/auth/users/${id}/approve`, { method: 'POST' });
export const authRejectUser = (id) => fetchJSON(`/auth/users/${id}/reject`, { method: 'POST' });
export const authResetPassword = (id, newPassword) => fetchJSON(`/auth/users/${id}/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newPassword }) });
export const authForgotPassword = (username, newPassword) => fetchJSON('/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, newPassword }) });
export const authChangePassword = (currentPassword, newPassword) => fetchJSON('/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });

/* ── PD Input — Export CSV (triggers browser download) ──────────── */
export const exportPdInputCsv = async (params = {}) => {
  const res = await fetch(`${BASE_URL}/pd-input/export${qs(params)}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Export ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pd_records_${todayStr()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
