import { RawMarkerEvidence, RawPdfScan } from './types';

const SCAN_CHUNK_BYTES = 1024 * 1024;
const TOKEN_OVERLAP_BYTES = 128;

const MARKERS: Array<{
  kind: RawMarkerEvidence['kind'];
  expression: RegExp;
}> = [
  { kind: 'encryption', expression: /\/Encrypt\b/ },
  { kind: 'javascript', expression: /\/JavaScript\b|\/JS\b/ },
  { kind: 'open-action', expression: /\/OpenAction\b/ },
  { kind: 'launch-action', expression: /\/Launch\b/ },
  { kind: 'additional-actions', expression: /\/AA\b/ },
  { kind: 'submit-form', expression: /\/SubmitForm\b/ },
  { kind: 'import-data', expression: /\/ImportData\b/ },
  { kind: 'remote-document', expression: /\/GoToR\b/ },
  { kind: 'embedded-files', expression: /\/EmbeddedFiles\b|\/Filespec\b/ },
  { kind: 'signature-field', expression: /\/FT\s*\/Sig\b/ },
  { kind: 'xfa-form', expression: /\/XFA\b/ }
];

export interface RawScanCallbacks {
  onProgress?: (
    stage: 'hashing' | 'scanning-structure',
    completed: number,
    total: number
  ) => void;
  isCancelled?: () => boolean;
  yieldToEventLoop?: () => Promise<void>;
}

export class RawScanCancelledError extends Error {
  constructor() {
    super('Raw PDF scan cancelled');
    this.name = 'RawScanCancelledError';
  }
}

function assertNotCancelled(isCancelled?: () => boolean): void {
  if (isCancelled?.()) {
    throw new RawScanCancelledError();
  }
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

function defaultYield(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export async function scanPdfBytes(
  bytes: ArrayBuffer,
  callbacks: RawScanCallbacks = {}
): Promise<RawPdfScan> {
  const {
    onProgress,
    isCancelled,
    yieldToEventLoop = defaultYield
  } = callbacks;
  const byteView = new Uint8Array(bytes);
  const decoder = new TextDecoder('latin1');

  assertNotCancelled(isCancelled);
  onProgress?.('hashing', 0, byteView.byteLength);

  let digest: ArrayBuffer;
  try {
    digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  } catch (error) {
    throw new Error(
      `Unable to calculate SHA-256: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  assertNotCancelled(isCancelled);
  onProgress?.('hashing', byteView.byteLength, byteView.byteLength);

  const markerOffsets = new Map<RawMarkerEvidence['kind'], number>();
  const headerWindow = decoder.decode(
    byteView.subarray(0, Math.min(byteView.byteLength, 1024))
  );
  const headerMatch = /%PDF-(\d\.\d)/.exec(headerWindow);
  const linearizationWindow = decoder.decode(
    byteView.subarray(0, Math.min(byteView.byteLength, 4096))
  );
  const linearizationMatch = /\/Linearized\b/.exec(linearizationWindow);
  if (linearizationMatch) {
    markerOffsets.set('linearization', linearizationMatch.index);
  }

  for (let start = 0; start < byteView.byteLength; start += SCAN_CHUNK_BYTES) {
    assertNotCancelled(isCancelled);
    const end = Math.min(
      byteView.byteLength,
      start + SCAN_CHUNK_BYTES + TOKEN_OVERLAP_BYTES
    );
    const chunk = decoder.decode(byteView.subarray(start, end));

    for (const marker of MARKERS) {
      if (markerOffsets.has(marker.kind)) {
        continue;
      }

      const match = marker.expression.exec(chunk);
      if (match) {
        markerOffsets.set(marker.kind, start + match.index);
      }
    }

    const completed = Math.min(byteView.byteLength, start + SCAN_CHUNK_BYTES);
    onProgress?.('scanning-structure', completed, byteView.byteLength);
    await yieldToEventLoop();
  }

  assertNotCancelled(isCancelled);

  const markerKinds: RawMarkerEvidence['kind'][] = [
    'encryption',
    'linearization',
    'javascript',
    'open-action',
    'launch-action',
    'additional-actions',
    'submit-form',
    'import-data',
    'remote-document',
    'embedded-files',
    'signature-field',
    'xfa-form'
  ];

  return {
    sha256: bytesToHex(digest),
    hasPdfHeader: Boolean(headerMatch),
    headerVersion: headerMatch?.[1] ?? null,
    headerByteOffset: headerMatch?.index ?? null,
    markers: markerKinds.map((kind) => ({
      kind,
      detected: markerOffsets.has(kind),
      firstByteOffset: markerOffsets.get(kind) ?? null
    })),
    scannedBytes: byteView.byteLength,
    notes: [
      'Raw token matches are supporting evidence, not a complete parse of PDF object structure.',
      'Tokens inside compressed or encoded object streams may not be visible to this scan.',
      'A token can also occur inside ordinary stream data, so raw-only detections are marked uncertain.'
    ]
  };
}
