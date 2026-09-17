'use client';

import { useEffect, useState } from 'react';

export function usePrivatePhoto(id: string) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ id: '', attempt: -1, url: '', error: false });
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    let active = true;
    void fetch(`/api/photos/${id}/access`, {
      method: 'POST',
      signal: controller.signal,
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('access');
        return response.json() as Promise<{ url: string }>;
      })
      .then(({ url }) => {
        if (active) setState({ id, attempt, url, error: false });
      })
      .catch(() => {
        if (active) setState({ id, attempt, url: '', error: true });
      })
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [id, attempt]);
  const current = state.id === id && state.attempt === attempt;
  return {
    url: current ? state.url : '',
    error: current && state.error,
    retry: () => setAttempt((value) => value + 1),
    imageError: () => setState({ id, attempt, url: '', error: true }),
  };
}
