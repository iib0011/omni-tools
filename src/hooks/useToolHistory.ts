import { useState, useCallback } from 'react';

const STORAGE_PREFIX = 'history_';
const MAX_ENTRIES = 10;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  input: string;
  result: string;
  options?: Record<string, unknown>;
}

function storageKey(toolPath: string): string {
  return STORAGE_PREFIX + toolPath.replace(/\//g, '_');
}

function loadHistory(toolPath: string): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(toolPath));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(toolPath: string, entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(storageKey(toolPath), JSON.stringify(entries));
  } catch {}
}

export function useToolHistory(toolPath: string) {
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    loadHistory(toolPath)
  );

  const pushEntry = useCallback(
    (input: string, result: string, options?: Record<string, unknown>) => {
      if (!input.trim() && !result.trim()) return;

      const entry: HistoryEntry = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        input,
        result,
        options
      };

      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, MAX_ENTRIES);
        saveHistory(toolPath, next);
        return next;
      });
    },
    [toolPath]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory(toolPath, []);
  }, [toolPath]);

  const removeEntry = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const next = prev.filter((e) => e.id !== id);
        saveHistory(toolPath, next);
        return next;
      });
    },
    [toolPath]
  );

  return { history, pushEntry, clearHistory, removeEntry };
}