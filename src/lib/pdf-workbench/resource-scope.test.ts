import { describe, expect, it, vi } from 'vitest';
import { ResourceScope, withResourceScope } from './resource-scope';

describe('ResourceScope', () => {
  it('disposes resources once in reverse registration order', async () => {
    const events: string[] = [];
    const scope = new ResourceScope();
    scope.defer(() => {
      events.push('first');
    });
    scope.defer(async () => {
      await Promise.resolve();
      events.push('second');
    });

    await scope.dispose();
    await scope.dispose();

    expect(events).toEqual(['second', 'first']);
  });

  it('cleans workers, cancellables, bitmaps, and canvases', async () => {
    const terminate = vi.fn();
    const cancel = vi.fn();
    const close = vi.fn();
    const canvas = { width: 100, height: 200 };
    const scope = new ResourceScope();

    scope.trackWorker({ terminate });
    scope.trackCancellable({ cancel });
    scope.trackBitmap({ close });
    scope.trackCanvas(canvas);
    await scope.dispose();

    expect(terminate).toHaveBeenCalledOnce();
    expect(cancel).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    expect(canvas).toEqual({ width: 0, height: 0 });
  });

  it('cleans up when an operation fails', async () => {
    const dispose = vi.fn();
    await expect(
      withResourceScope(async (scope) => {
        scope.defer(dispose);
        throw new Error('fixture failure');
      })
    ).rejects.toThrow('fixture failure');
    expect(dispose).toHaveBeenCalledOnce();
  });

  it('reports cleanup failures after attempting every disposer', async () => {
    const stillRuns = vi.fn();
    const scope = new ResourceScope();
    scope.defer(stillRuns);
    scope.defer(() => {
      throw new Error('close failed');
    });
    await expect(scope.dispose()).rejects.toBeInstanceOf(AggregateError);
    expect(stillRuns).toHaveBeenCalledOnce();
  });
});
