import { useCallback, useEffect, useRef } from 'react';
import _ from 'lodash';

/**
 * Debounce hook.
 * @param {T} callback
 * @param {number} delay
 * @returns {T}
 */
function useDebounce<T extends (...args: never[]) => void>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef<T>(callback);

  // Update the current callback each time it changes.
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedFn = useCallback(
    _.debounce((...args: never[]) => {
      callbackRef.current(...args);
    }, delay),
    [delay]
  );

  useEffect(() => {
    // Cleanup function to cancel any pending debounced calls
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);

  return debouncedFn as unknown as T;
}

export default useDebounce;
