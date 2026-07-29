import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { saveBlob } from './save-file';

describe('saveBlob', () => {
  const createObjectURL = vi.fn(() => 'blob:pdf-workbench-test');
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('removes the temporary link and revokes its URL after a download', async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    await expect(
      saveBlob(new Blob(['pdf']), {
        suggestedName: 'output.pdf',
        mimeType: 'application/pdf',
        extensions: ['.pdf'],
        preferFilePicker: false
      })
    ).resolves.toBe('download');

    expect(click).toHaveBeenCalledOnce();
    expect(document.querySelector('a[download="output.pdf"]')).toBeNull();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:pdf-workbench-test');
  });

  it('cleans up and returns a structured error when clicking fails', async () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      throw new Error('click failed');
    });

    await expect(
      saveBlob(new Blob(['pdf']), {
        suggestedName: 'output.pdf',
        mimeType: 'application/pdf',
        extensions: ['.pdf'],
        preferFilePicker: false
      })
    ).rejects.toMatchObject({
      code: 'save-failed',
      details: 'click failed'
    });

    expect(document.querySelector('a[download="output.pdf"]')).toBeNull();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:pdf-workbench-test');
  });
});
