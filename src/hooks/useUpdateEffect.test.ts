import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import useUpdateEffect from './useUpdateEffect';

describe('useUpdateEffect', () => {
  it('does not invoke the effect on initial mount', () => {
    const effect = vi.fn();
    renderHook(() => useUpdateEffect(effect, []));
    expect(effect).not.toHaveBeenCalled();
  });

  it('invokes the effect when dependencies update', () => {
    const effect = vi.fn();
    const { rerender } = renderHook(
      ({ dep }) => useUpdateEffect(effect, [dep]),
      { initialProps: { dep: 0 } }
    );
    rerender({ dep: 1 });
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
