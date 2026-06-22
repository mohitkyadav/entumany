import {useCallback, useEffect, useRef, useState} from 'react';

/**
 * useState whose value is mirrored to localStorage (debounced 250ms), JSON-encoded.
 * On first mount the stored JSON is shallow-merged into `initial` so newly added
 * default fields are picked up without clobbering existing saved data.
 */
export function usePersistentState<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void] {
  const [state, setStateRaw] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return initial;
      const parsed = JSON.parse(raw) as Partial<T>;
      return {...initial, ...parsed};
    } catch {
      return initial;
    }
  });

  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        // ignore quota / private-mode errors
      }
    }, 250);
    return () => clearTimeout(timer.current);
  }, [key, state]);

  const setState = useCallback((next: T | ((prev: T) => T)) => {
    setStateRaw(next);
  }, []);

  return [state, setState];
}
