import { useState, useEffect, useRef, useCallback } from 'react';
import { getMachinePerformance, getFilterOptions } from '../services/api';

export function useDashboard(filters) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const hasLoadedOnce = useRef(false);

  const load = useCallback((background = false) => {
    background ? setRefreshing(true) : setLoading(true);
    if (!background) setError(null);
    getMachinePerformance(filters)
      .then((res) => { setData(res); if (!background) setError(null); })
      .catch((e) => { if (!background) setError(e.message); })
      .finally(() => {
        background ? setRefreshing(false) : setLoading(false);
        hasLoadedOnce.current = true;
      });
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    load(hasLoadedOnce.current);
  }, [load]);

  return { data, loading, refreshing, error, reload: load };
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
