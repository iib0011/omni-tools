import { useState, useEffect, useRef } from 'react';
import useDebounce from './useDebounce';

interface UseRealtimePreviewOptions<TInput, TOptions> {
  /** current input value (text, file, etc.) */
  input: TInput;
  /** current option values (Formik values or equivalent) */
  options: TOptions;
  /** pure function that transforms input + options into a result */
  compute: (input: TInput, options: TOptions) => string;
  /** delay in ms before recomputing after change (default: 300) */
  debounceMs?: number;
  /** if false, disables preview and does not call compute (default: true) */
  enabled?: boolean;
}

interface UseRealtimePreviewResult {
  result: string;
  isPending: boolean;
  error: string | null;
}

export function useRealtimePreview<TInput, TOptions>({
  input,
  options,
  compute,
  debounceMs = 300,
  enabled = true
}: UseRealtimePreviewOptions<TInput, TOptions>): UseRealtimePreviewResult {
  const [result, setResult] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable reference for compute — avoids recreating the effect
  // when the function is recreated during parent component render
  const computeRef = useRef(compute);
  useEffect(() => {
    computeRef.current = compute;
  }, [compute]);

  const runCompute = useDebounce(() => {
    if (!enabled) return;

    setIsPending(true);
    setError(null);

    try {
      const output = computeRef.current(input, options);
      setResult(output);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setResult('');
    } finally {
      setIsPending(false);
    }
  }, debounceMs);

  useEffect(() => {
    if (!enabled) {
      setResult('');
      setError(null);
      return;
    }
    setIsPending(true);
    runCompute();
  }, [input, options, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return { result, isPending, error };
}
