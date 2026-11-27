import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Keeps a list's page and filters in the URL (?page=2&search=oud), so a view can be bookmarked and the Back
 * button returns to it. Used by every list, public and admin. `keys` are the filter names the list understands.
 * Any filter change goes back to page 1.
 */
export function useListParams<K extends string>(keys: readonly K[]) {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number.parseInt(params.get('page') ?? '1', 10) || 1);
  const values = Object.fromEntries(
    keys.map((key) => [key, (params.get(key) ?? '').trim()]),
  ) as Record<K, string>;

  const set = useCallback(
    (changes: Partial<Record<K | 'page', string>>, replace = false) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!('page' in changes)) next.delete('page');
          for (const [key, value] of Object.entries(changes) as [string, string][]) {
            if (value) next.set(key, value);
            else next.delete(key);
          }
          return next;
        },
        { replace },
      );
    },
    [setParams],
  );

  const clear = () => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('page');
        for (const key of keys) next.delete(key);
        return next;
      },
      { replace: true },
    );
  };

  return { page, values, set, clear };
}

/**
 * The text of a search box. Typing waits `delay` ms before it is "committed" to the URL; Enter commits at once.
 * Keep the box and the URL apart this way so every keystroke does not reload the list.
 */
export function useSearchInput(committed: string, commit: (value: string) => void, delay = 350) {
  const [text, setText] = useState(committed);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onChange = (value: string) => {
    setText(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => commit(value.trim()), delay);
  };
  const submit = () => {
    window.clearTimeout(timer.current);
    commit(text.trim());
  };
  const reset = () => {
    window.clearTimeout(timer.current);
    setText('');
  };
  return { text, onChange, submit, reset };
}
