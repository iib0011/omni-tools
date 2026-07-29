import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pipe_target';

export interface PipePayload {
  /** result that will be injected as the input of the target tool */
  value: string;
  /** path of the source tool, e.g. "base64-encode" */
  sourcePath: string;
  /** readable label of the source tool, e.g. "Base64 Encode" */
  sourceLabel: string;
  /** timestamp to identify whether the payload is new */
  createdAt: number;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadPayload(): PipePayload | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePayload(payload: PipePayload | null): void {
  try {
    if (payload === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
  } catch {}
}

// ─── Hook to sender ─────────────────────────────────

export function usePipeSend(sourcePath: string, sourceLabel: string) {
  const send = useCallback(
    (value: string) => {
      const payload: PipePayload = {
        value,
        sourcePath,
        sourceLabel,
        createdAt: Date.now()
      };
      savePayload(payload);
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: JSON.stringify(payload)
        })
      );
    },
    [sourcePath, sourceLabel]
  );

  return { send };
}

// ─── Hook to receiver ───────────────────────────────

export function usePipeReceive() {
  const [payload, setPayload] = useState<PipePayload | null>(loadPayload);

  // Listen for changes coming from other tabs or from usePipeSend itself
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      try {
        setPayload(e.newValue ? JSON.parse(e.newValue) : null);
      } catch {
        setPayload(null);
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const consume = useCallback(() => {
    setPayload(null);
    savePayload(null);
  }, []);

  return { payload, consume };
}