import { PDFDocument, PDFName, PDFString, StandardFonts } from 'pdf-lib';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { scanPdfBytes } from './raw-scan';
import type { InspectPdfDependencies } from './service';

let inspectPdf: typeof import('./service').inspectPdf;

class TestDOMMatrix {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;
}

const PASSWORD_PADDING = Uint8Array.from([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56, 0xff,
  0xfa, 0x01, 0x08, 0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80, 0x2f, 0x0c,
  0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a
]);
const textEncoder = new TextEncoder();

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const output = new Uint8Array(
    parts.reduce((sum, part) => sum + part.byteLength, 0)
  );
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.byteLength;
  }
  return output;
}

function ownedArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const output = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(output).set(bytes);
  return output;
}

function paddedPassword(password: string): Uint8Array {
  const encoded = textEncoder.encode(password);
  return concatBytes(encoded.subarray(0, 32), PASSWORD_PADDING).subarray(0, 32);
}

function md5(bytes: Uint8Array): Uint8Array {
  return new Uint8Array(createHash('md5').update(bytes).digest());
}

function rc4(key: Uint8Array, input: Uint8Array): Uint8Array {
  const state = Uint8Array.from({ length: 256 }, (_, index) => index);
  let j = 0;
  for (let index = 0; index < 256; index += 1) {
    j = (j + state[index] + key[index % key.length]) & 0xff;
    [state[index], state[j]] = [state[j], state[index]];
  }
  const output = new Uint8Array(input.length);
  let i = 0;
  j = 0;
  for (let index = 0; index < input.length; index += 1) {
    i = (i + 1) & 0xff;
    j = (j + state[i]) & 0xff;
    [state[i], state[j]] = [state[j], state[i]];
    output[index] = input[index] ^ state[(state[i] + state[j]) & 0xff];
  }
  return output;
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

function createPasswordProtectedFixture(): File {
  const ownerKey = md5(paddedPassword('owner')).subarray(0, 5);
  const ownerEntry = rc4(ownerKey, paddedPassword('secret'));
  const permissionBytes = new Uint8Array(4);
  new DataView(permissionBytes.buffer).setInt32(0, -4, true);
  const fileId = md5(textEncoder.encode('omnitools-encrypted-fixture'));
  const fileKey = md5(
    concatBytes(paddedPassword('secret'), ownerEntry, permissionBytes, fileId)
  ).subarray(0, 5);
  const userEntry = rc4(fileKey, PASSWORD_PADDING);
  const objectKey = md5(
    concatBytes(fileKey, Uint8Array.from([4, 0, 0, 0, 0]))
  ).subarray(0, 10);
  const encryptedContent = rc4(objectKey, textEncoder.encode('q\nQ\n'));

  const objectBodies: Uint8Array[] = [
    textEncoder.encode('<< /Type /Catalog /Pages 2 0 R >>'),
    textEncoder.encode('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'),
    textEncoder.encode(
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>'
    ),
    concatBytes(
      textEncoder.encode(`<< /Length ${encryptedContent.length} >>\nstream\n`),
      encryptedContent,
      textEncoder.encode('\nendstream')
    ),
    textEncoder.encode(
      `<< /Filter /Standard /V 1 /R 2 /Length 40 /O <${hex(
        ownerEntry
      )}> /U <${hex(userEntry)}> /P -4 >>`
    )
  ];
  const chunks: Uint8Array[] = [
    textEncoder.encode('%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n')
  ];
  const offsets = [0];
  let length = chunks[0].length;
  objectBodies.forEach((body, index) => {
    offsets.push(length);
    const object = concatBytes(
      textEncoder.encode(`${index + 1} 0 obj\n`),
      body,
      textEncoder.encode('\nendobj\n')
    );
    chunks.push(object);
    length += object.length;
  });
  const xrefOffset = length;
  const xref = [
    'xref',
    '0 6',
    '0000000000 65535 f ',
    ...offsets
      .slice(1)
      .map((offset) => `${String(offset).padStart(10, '0')} 00000 n `),
    'trailer',
    `<< /Size 6 /Root 1 0 R /Encrypt 5 0 R /ID [<${hex(fileId)}> <${hex(
      fileId
    )}>] >>`,
    'startxref',
    String(xrefOffset),
    '%%EOF',
    ''
  ].join('\n');
  chunks.push(textEncoder.encode(xref));

  return new File([ownedArrayBuffer(concatBytes(...chunks))], 'protected.pdf', {
    type: 'application/pdf'
  });
}

async function createInspectorFixture(): Promise<File> {
  const document = await PDFDocument.create();
  document.setTitle('Inspector fixture');
  document.setAuthor('OmniTools tests');
  document.setSubject('Metadata, form, attachment, and action coverage');
  document.setCreationDate(new Date('2020-01-02T03:04:05.000Z'));
  document.setModificationDate(new Date('2020-02-03T04:05:06.000Z'));

  const page = document.addPage([612, 792]);
  const font = await document.embedFont(StandardFonts.Helvetica);
  page.drawText('Known extractable fixture text', {
    x: 72,
    y: 720,
    font,
    size: 14
  });

  const form = document.getForm();
  const field = form.createTextField('Contact.Name');
  field.setText('Ada');
  field.addToPage(page, {
    x: 72,
    y: 650,
    width: 180,
    height: 24,
    font
  });

  await document.attach(
    new TextEncoder().encode('attached fixture'),
    'notes.txt',
    {
      mimeType: 'text/plain',
      description: 'Deterministic test attachment',
      creationDate: new Date('2020-01-02T03:04:05.000Z'),
      modificationDate: new Date('2020-02-03T04:05:06.000Z')
    }
  );

  const openJavaScript = document.context.obj({
    S: PDFName.of('JavaScript'),
    JS: PDFString.of('console.println("fixture")')
  });
  document.catalog.set(PDFName.of('OpenAction'), openJavaScript);

  const bytes = await document.save({ useObjectStreams: false });
  return new File([ownedArrayBuffer(bytes)], 'inspector-fixture.pdf', {
    type: 'application/pdf'
  });
}

async function createThreePageFixture(): Promise<File> {
  const document = await PDFDocument.create();
  document.addPage([300, 400]);
  document.addPage([300, 400]);
  document.addPage([300, 400]);
  return new File(
    [ownedArrayBuffer(await document.save())],
    'three-pages.pdf',
    {
      type: 'application/pdf'
    }
  );
}

const inlineRawScan: InspectPdfDependencies['startRawScan'] = (
  bytes,
  _requestId,
  onProgress
) => {
  let cancelled = false;
  return {
    promise: scanPdfBytes(bytes, {
      isCancelled: () => cancelled,
      onProgress: (stage, completed, total) =>
        onProgress?.({ stage, completed, total }),
      yieldToEventLoop: async () => {}
    }),
    cancel: () => {
      cancelled = true;
    }
  };
};

describe('inspectPdf integration', () => {
  beforeAll(async () => {
    vi.stubGlobal('DOMMatrix', TestDOMMatrix);
    ({ inspectPdf } = await import('./service'));
    const { GlobalWorkerOptions } = await import('pdfjs-dist');
    GlobalWorkerOptions.workerSrc = pathToFileURL(
      resolve(process.cwd(), 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
    ).href;
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('reports known metadata, form, attachment, action, hash, and page data', async () => {
    const file = await createInspectorFixture();
    const expectedDigest = Array.from(
      new Uint8Array(
        await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
      ),
      (byte) => byte.toString(16).padStart(2, '0')
    ).join('');

    const report = await inspectPdf(
      file,
      {
        signal: new AbortController().signal,
        now: () => new Date('2026-01-02T03:04:05.000Z')
      },
      { startRawScan: inlineRawScan }
    );

    expect(report.file.sha256).toBe(expectedDigest);
    expect(report.file.name).toBe('inspector-fixture.pdf');
    expect(report.document.pageCount).toBe(1);
    expect(report.metadata.documentInfo).toMatchObject({
      Title: 'Inspector fixture',
      Author: 'OmniTools tests'
    });
    expect(report.forms.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Contact.Name',
          type: 'text',
          pageNumbers: [1]
        })
      ])
    );
    expect(report.attachments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'notes.txt',
          byteSize: 16,
          source: 'document'
        })
      ])
    );
    expect(report.activeContent.javascript.length).toBeGreaterThan(0);
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'document-metadata' }),
        expect.objectContaining({ id: 'forms' }),
        expect.objectContaining({ id: 'embedded-attachments' }),
        expect.objectContaining({ id: 'javascript' })
      ])
    );
    expect(report.pages[0]).toMatchObject({
      widthPoints: 612,
      heightPoints: 792,
      orientation: 'portrait'
    });
    expect(report.pages[0].extractableTextCharacters).toBeGreaterThan(20);
  });

  it('rejects malformed input with a structured error', async () => {
    const malformed = new File(
      [
        ownedArrayBuffer(
          new TextEncoder().encode('%PDF-1.7\nnot a real document')
        )
      ],
      'malformed.pdf',
      { type: 'application/pdf' }
    );

    await expect(
      inspectPdf(
        malformed,
        { signal: new AbortController().signal },
        { startRawScan: inlineRawScan }
      )
    ).rejects.toMatchObject({
      code: 'malformed-pdf'
    });
  });

  it('returns useful password errors and inspects encrypted input with the correct password', async () => {
    const protectedFile = createPasswordProtectedFixture();

    await expect(
      inspectPdf(
        protectedFile,
        { signal: new AbortController().signal },
        { startRawScan: inlineRawScan }
      )
    ).rejects.toMatchObject({
      code: 'password-required'
    });

    await expect(
      inspectPdf(
        protectedFile,
        {
          password: 'wrong',
          signal: new AbortController().signal
        },
        { startRawScan: inlineRawScan }
      )
    ).rejects.toMatchObject({
      code: 'incorrect-password'
    });

    const report = await inspectPdf(
      protectedFile,
      {
        password: 'secret',
        signal: new AbortController().signal
      },
      { startRawScan: inlineRawScan }
    );

    expect(report.document.passwordRequired).toBe(true);
    expect(report.document.encryption.state).toBe('detected');
    expect(report.document.permissions.exposed).toBe(true);
    expect(report.document.pageCount).toBe(1);
  });

  it('cancels before subsequent pages are processed', async () => {
    const controller = new AbortController();
    const visitedPages: number[] = [];

    await expect(
      inspectPdf(
        await createThreePageFixture(),
        {
          signal: controller.signal,
          onProgress: (progress) => {
            if (
              progress.stage === 'pages' &&
              progress.pageNumber &&
              !visitedPages.includes(progress.pageNumber)
            ) {
              visitedPages.push(progress.pageNumber);
              if (progress.pageNumber === 2) {
                controller.abort();
              }
            }
          }
        },
        { startRawScan: inlineRawScan }
      )
    ).rejects.toMatchObject({ code: 'cancelled' });

    expect(visitedPages).toEqual([1, 2]);
  });
});
