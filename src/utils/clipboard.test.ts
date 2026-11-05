import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyToClipboard } from './clipboard';

const text = '{"hello":"world"}';

function mockClipboardApi(enabled: boolean, reject = false) {
  const writeText = vi.fn(
    () =>
      new Promise<void>((resolve, rejectFn) => {
        if (reject) {
          rejectFn(new Error('permission denied'));
        } else {
          resolve();
        }
      })
  );
  Object.defineProperty(globalThis, 'navigator', {
    value: enabled
      ? { clipboard: { writeText } }
      : { clipboard: undefined },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, 'isSecureContext', {
    value: true,
    configurable: true,
    writable: true,
  });
  return writeText;
}

function mockExecCommand(returnValue: boolean) {
  const execCommand = vi.fn(() => returnValue);
  Object.defineProperty(document, 'execCommand', {
    value: execCommand,
    configurable: true,
    writable: true,
  });
  return execCommand;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('copyToClipboard', () => {
  it('uses the async Clipboard API when available', async () => {
    const writeText = mockClipboardApi(true);
    await copyToClipboard(text);
    expect(writeText).toHaveBeenCalledWith(text);
  });

  it('falls back to execCommand when the Clipboard API is unavailable', async () => {
    mockClipboardApi(false);
    const execCommand = mockExecCommand(true);
    const appendChild = vi.spyOn(document.body, 'appendChild');

    await copyToClipboard(text);

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(appendChild).toHaveBeenCalledTimes(1);
  });

  it('falls back to execCommand when the Clipboard API rejects', async () => {
    mockClipboardApi(true, true);
    const execCommand = mockExecCommand(true);

    await copyToClipboard(text);

    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  it('throws when the fallback execCommand returns false', async () => {
    mockClipboardApi(false);
    mockExecCommand(false);

    await expect(copyToClipboard(text)).rejects.toThrow('copy');
  });
});
