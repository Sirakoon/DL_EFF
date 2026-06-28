const BASE_URL = 'http://localhost:3000/api';

async function fetchJSON(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  return res.json();
}

export function getMachinePerformance(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
  ).toString();
  return fetchJSON(`/dashboard/machine-performance${qs ? '?' + qs : ''}`);
}

export function getFilterOptions() {
  return fetchJSON('/dashboard/filters');
}
