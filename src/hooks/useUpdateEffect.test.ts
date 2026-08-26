import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useUpdateEffect from './useUpdateEffect';

describe('useUpdateEffect', () => {
  it('does not run the effect on initial mount', () => {
    const effect = vi.fn();
    renderHook(() => useUpdateEffect(effect));
    expect(effect).not.toHaveBeenCalled();
  });

  it('runs the effect on updates only', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(({ n }) => useUpdateEffect(effect, [n]), {
      initialProps: { n: 1 },
    });
    expect(effect).not.toHaveBeenCalled();

    rerender({ n: 2 });
    expect(effect).toHaveBeenCalledTimes(1);

    rerender({ n: 3 });
    expect(effect).toHaveBeenCalledTimes(2);
  });

  it('runs the previous cleanup before the next update effect', () => {
    const cleanup = vi.fn();
    const effect = vi.fn(() => cleanup);
    const { rerender } = renderHook(({ n }) => useUpdateEffect(effect, [n]), {
      initialProps: { n: 1 },
    });

    rerender({ n: 2 });
    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    rerender({ n: 3 });
    expect(effect).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
