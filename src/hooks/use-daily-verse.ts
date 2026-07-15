import { useEffect, useState } from 'react';

import { DailyVerse, getDailyVerse } from '@/lib/daily-verse';

export function useDailyVerse() {
  const [state, setState] = useState<{
    loading: boolean;
    verse: DailyVerse | null;
    error: string | null;
  }>({ loading: true, verse: null, error: null });

  useEffect(() => {
    let cancelled = false;

    getDailyVerse()
      .then((verse) => {
        if (!cancelled) setState({ loading: false, verse, error: null });
      })
      .catch(() => {
        if (!cancelled) {
          setState({ loading: false, verse: null, error: "Couldn't load today's verse." });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
