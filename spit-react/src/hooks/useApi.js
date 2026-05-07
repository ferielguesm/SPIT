import { useState, useEffect, useRef, useCallback } from 'react';

export function useApi(apiFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Keep a stable ref to the latest apiFn so we don't need it in deps
  const apiFnRef = useRef(apiFn);
  useEffect(() => { apiFnRef.current = apiFn; });

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFnRef.current();
      // Guard: if result is not what we expect, don't crash
      setData(result ?? null);
    } catch (e) {
      setError(e.message || 'Request failed');
      setData(null);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}
