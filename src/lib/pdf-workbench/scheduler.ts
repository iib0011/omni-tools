import { throwIfAborted } from './errors';

export async function yieldToBrowser(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

export async function mapWithConcurrency<Input, Output>(
  values: readonly Input[],
  mapper: (value: Input, index: number) => Promise<Output>,
  options: { concurrency?: number; signal?: AbortSignal } = {}
): Promise<Output[]> {
  const concurrency = Math.max(1, Math.min(2, options.concurrency ?? 2));
  const results = new Array<Output>(values.length);
  let nextIndex = 0;

  const run = async () => {
    while (nextIndex < values.length) {
      throwIfAborted(options.signal);
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(values[index], index);
      await yieldToBrowser();
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, run)
  );
  return results;
}
