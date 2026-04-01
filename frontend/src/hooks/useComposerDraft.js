'use client';

import { useEffect, useMemo, useState } from 'react';

const STORAGE_PREFIX = 'draftsphere:drafts:';

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

export default function useComposerDraft(storageKey, value, options = {}) {
  const { enabled = true, debounceMs = 700 } = options;
  const key = useMemo(() => `${STORAGE_PREFIX}${storageKey}`, [storageKey]);
  const [savedAt, setSavedAt] = useState(null);
  const [restoredValue, setRestoredValue] = useState(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return;
    }

    const parsed = safeParse(raw);
    if (!parsed?.value) {
      return;
    }

    setRestoredValue(parsed.value);
    setSavedAt(parsed.savedAt || null);
  }, [enabled, key]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || !hasRestoredDraft) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const hasMeaningfulContent = Object.values(value || {}).some((fieldValue) =>
        typeof fieldValue === 'string' ? fieldValue.trim() : Boolean(fieldValue)
      );

      if (!hasMeaningfulContent) {
        window.localStorage.removeItem(key);
        setSavedAt(null);
        return;
      }

      const nextSavedAt = nowIso();
      window.localStorage.setItem(
        key,
        JSON.stringify({
          value,
          savedAt: nextSavedAt,
        })
      );
      setSavedAt(nextSavedAt);
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [debounceMs, enabled, hasRestoredDraft, key, value]);

  function confirmRestored() {
    setHasRestoredDraft(true);
  }

  function clearDraft() {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
    setSavedAt(null);
    setRestoredValue(null);
  }

  return {
    restoredValue,
    savedAt,
    hasRestoredDraft,
    confirmRestored,
    clearDraft,
  };
}
