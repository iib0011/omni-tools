import { describe, expect, it } from 'vitest';
import { verifyPdfOutput } from './verify';

describe('verifyPdfOutput', () => {
  it('honors a pre-aborted verification request before opening the PDF', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      verifyPdfOutput(new ArrayBuffer(0), {
        pageCount: 1,
        signal: controller.signal
      })
    ).rejects.toMatchObject({ code: 'cancelled' });
  });
});
