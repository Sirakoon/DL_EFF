import { useState, useEffect, useCallback } from 'react';
import { getMachinePerformance, getFilterOptions } from '../services/api';

export function useDashboard(filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getMachinePerformance(filters)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

export function useFilterOptions() {
  const [options, setOptions] = useState({ machines: [], shifts: [], productGroups: [] });

  useEffect(() => {
    getFilterOptions()
      .then(setOptions)
      .catch(() => { });
  }, []);

  return options;
}
