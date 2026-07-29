type Disposer = () => void | Promise<void>;

export class ResourceScope {
  private disposers: Disposer[] = [];
  private disposed = false;

  defer(disposer: Disposer): void {
    if (this.disposed) {
      void disposer();
      return;
    }
    this.disposers.push(disposer);
  }

  trackObjectUrl(url: string): string {
    this.defer(() => URL.revokeObjectURL(url));
    return url;
  }

  trackWorker<T extends { terminate: () => void }>(worker: T): T {
    this.defer(() => worker.terminate());
    return worker;
  }

  trackDestroyable<T extends { destroy: () => void | Promise<void> }>(
    resource: T
  ): T {
    this.defer(() => resource.destroy());
    return resource;
  }

  trackCancellable<T extends { cancel: () => void }>(resource: T): T {
    this.defer(() => resource.cancel());
    return resource;
  }

  trackBitmap<T extends { close: () => void }>(bitmap: T): T {
    this.defer(() => bitmap.close());
    return bitmap;
  }

  trackCanvas<T extends { width: number; height: number }>(canvas: T): T {
    this.defer(() => {
      canvas.width = 0;
      canvas.height = 0;
    });
    return canvas;
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    const failures: unknown[] = [];

    for (const disposer of this.disposers.reverse()) {
      try {
        await disposer();
      } catch (error) {
        failures.push(error);
      }
    }
    this.disposers = [];

    if (failures.length > 0) {
      throw new AggregateError(
        failures,
        'One or more resources failed to close.'
      );
    }
  }
}

export async function withResourceScope<T>(
  operation: (scope: ResourceScope) => Promise<T>
): Promise<T> {
  const scope = new ResourceScope();
  try {
    return await operation(scope);
  } finally {
    await scope.dispose();
  }
}
