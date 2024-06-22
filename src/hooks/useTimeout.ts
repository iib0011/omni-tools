import { useEffect, useRef } from 'react';

/**
 * The useTimeout function is a custom hook that sets a timeout for a given callback function.
 * It takes in a callback function and a delay time in milliseconds as parameters.
 * It returns nothing.
 */
function useTimeout(callback: () => void, delay: number) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (delay !== null && callback && typeof callback === 'function') {
      timer = setTimeout(callbackRef.current, delay);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [callback, delay]);
}

export default useTimeout;
