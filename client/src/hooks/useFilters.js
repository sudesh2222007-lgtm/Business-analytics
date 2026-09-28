import { useState, useEffect, useCallback } from 'react';
import { getFilterOptions } from '../api';

export default function useFilters() {
  const [options, setOptions] = useState({ regions: [], categories: [], segments: [] });
  const [filters, setFilters] = useState({ startDate: '', endDate: '', region: 'All', category: 'All', segment: 'All' });

  useEffect(() => {
    getFilterOptions().then(setOptions).catch(() => {});
  }, []);

  const reset = useCallback(() => {
    setFilters({ startDate: '', endDate: '', region: 'All', category: 'All', segment: 'All' });
  }, []);

  // Build clean query params (drop empty / "All")
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v && v !== 'All')
  );

  return { options, filters, setFilters, reset, params };
}
