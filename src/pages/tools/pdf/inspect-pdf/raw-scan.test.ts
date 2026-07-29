import { RawScanCancelledError, scanPdfBytes } from './raw-scan';

const encoder = new TextEncoder();

describe('scanPdfBytes', () => {
  it('calculates a deterministic SHA-256 and records selected structure markers', async () => {
    const source =
      '%PDF-1.7\n' +
      '1 0 obj\n' +
      '<< /Linearized 1 /OpenAction 2 0 R /EmbeddedFiles 3 0 R /FT /Sig >>\n' +
      'endobj\n' +
      '%%EOF';
    const bytes = encoder.encode(source).buffer;
    const progress: string[] = [];

    const result = await scanPdfBytes(bytes, {
      onProgress: (stage) => progress.push(stage),
      yieldToEventLoop: async () => {}
    });

    expect(result.sha256).toBe(
      'a108053a575f478921efcf3180de694c66b6a4c4d65767bfe79f6a75a2027a52'
    );
    expect(result.hasPdfHeader).toBe(true);
    expect(result.headerVersion).toBe('1.7');
    expect(
      result.markers.find((marker) => marker.kind === 'linearization')
    ).toMatchObject({ detected: true });
    expect(
      result.markers.find((marker) => marker.kind === 'open-action')
    ).toMatchObject({ detected: true });
    expect(
      result.markers.find((marker) => marker.kind === 'embedded-files')
    ).toMatchObject({ detected: true });
    expect(
      result.markers.find((marker) => marker.kind === 'signature-field')
    ).toMatchObject({ detected: true });
    expect(progress).toContain('hashing');
    expect(progress).toContain('scanning-structure');
  });

  it('does not infer markers that are absent', async () => {
    const result = await scanPdfBytes(
      encoder.encode('%PDF-1.4\n%%EOF').buffer,
      { yieldToEventLoop: async () => {} }
    );

    expect(result.markers.every((marker) => !marker.detected)).toBe(true);
  });

  it('stops after cancellation is requested', async () => {
    let cancelled = false;

    await expect(
      scanPdfBytes(encoder.encode('%PDF-1.7\n%%EOF').buffer, {
        onProgress: (stage, completed, total) => {
          if (stage === 'hashing' && completed === total) {
            cancelled = true;
          }
        },
        isCancelled: () => cancelled,
        yieldToEventLoop: async () => {}
      })
    ).rejects.toBeInstanceOf(RawScanCancelledError);
  });
});
