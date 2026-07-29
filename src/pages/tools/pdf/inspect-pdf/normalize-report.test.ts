import { normalizeInspectorReport } from './normalize-report';
import { InspectorEvidence, PageInspection, RawPdfScan } from './types';

const raw: RawPdfScan = {
  sha256: 'a'.repeat(64),
  hasPdfHeader: true,
  headerVersion: '1.7',
  headerByteOffset: 0,
  scannedBytes: 1024,
  notes: ['Raw scan fixture note.'],
  markers: [
    {
      kind: 'encryption',
      detected: false,
      firstByteOffset: null
    },
    {
      kind: 'linearization',
      detected: true,
      firstByteOffset: 24
    },
    {
      kind: 'javascript',
      detected: false,
      firstByteOffset: null
    },
    {
      kind: 'open-action',
      detected: false,
      firstByteOffset: null
    },
    {
      kind: 'launch-action',
      detected: false,
      firstByteOffset: null
    },
    {
      kind: 'additional-actions',
      detected: false,
      firstByteOffset: null
    },
    {
      kind: 'submit-form',
      detected: false,
      firstByteOffset: null
    },
    {
      kind: 'import-data',
      detected: false,
      firstByteOffset: null
    },
    {
      kind: 'remote-document',
      detected: false,
      firstByteOffset: null
    },
    {
      kind: 'embedded-files',
      detected: false,
      firstByteOffset: null
    },
    {
      kind: 'signature-field',
      detected: false,
      firstByteOffset: null
    },
    {
      kind: 'xfa-form',
      detected: false,
      firstByteOffset: null
    }
  ]
};

const page: PageInspection = {
  pageNumber: 1,
  widthPoints: 612,
  heightPoints: 792,
  displayedWidthPoints: 612,
  displayedHeightPoints: 792,
  orientation: 'portrait',
  rotation: 0,
  extractableTextCharacters: 11,
  lowExtractableText: true,
  annotationCount: 1,
  annotationsByType: { widget: 1 },
  links: [],
  actions: [],
  imagePaintOperations: 2,
  approximateFontNames: ['Helvetica'],
  resourceNote: 'Fixture resource note.'
};

function evidence(
  overrides: Partial<InspectorEvidence['document']> = {}
): InspectorEvidence {
  return {
    generatedAt: '2026-01-02T03:04:05.000Z',
    file: {
      name: 'fixture.pdf',
      byteSize: 1024,
      mimeType: 'application/pdf',
      sha256: raw.sha256
    },
    pdfJsVersion: '5.2.133',
    raw,
    document: {
      pdfVersion: '1.7',
      pageCount: 1,
      passwordRequired: false,
      encryptionFilter: null,
      parserFlags: {
        isLinearized: null,
        hasAcroForm: true,
        hasXfa: false,
        hasSignatures: true
      },
      permissions: {
        exposed: false,
        rawFlags: null,
        allowed: null,
        note: 'No permissions exposed.'
      },
      metadata: {
        Title: 'Fixture',
        Author: 'Test Author'
      },
      xmpRaw: '<x:xmpmeta />',
      xmpProperties: {
        'dc:title': 'Fixture'
      },
      fields: [
        {
          name: 'Approval',
          type: 'signature',
          widgetCount: 1,
          pageNumbers: [1],
          hasActions: false
        }
      ],
      attachments: [],
      javascript: [],
      openActionPresent: false,
      outlineLinks: [],
      hasJavaScriptActions: false,
      ...overrides
    },
    pages: [page],
    uncertainties: []
  };
}

describe('normalizeInspectorReport', () => {
  it('normalizes metadata, forms, signatures, page text, and resources deterministically', () => {
    const report = normalizeInspectorReport(evidence());

    expect(report.generatedAt).toBe('2026-01-02T03:04:05.000Z');
    expect(report.file.sha256).toBe(raw.sha256);
    expect(report.metadata.documentInfo).toEqual({
      Title: 'Fixture',
      Author: 'Test Author'
    });
    expect(report.metadata.xmp.present).toBe(true);
    expect(report.forms.fields).toHaveLength(1);
    expect(report.forms.signatureFields).toEqual([
      expect.objectContaining({ name: 'Approval', pageNumbers: [1] })
    ]);
    expect(report.text).toMatchObject({
      totalExtractableCharacters: 11,
      lowTextPages: [1]
    });
    expect(report.resources).toMatchObject({
      imagePaintOperations: 2,
      approximateFontNames: ['Helvetica']
    });
    expect(report.document.linearization.state).toBe('appears-linearized');
  });

  it('reports attachment and action findings only when evidence is present', () => {
    const clean = normalizeInspectorReport(
      evidence({
        metadata: {},
        xmpRaw: null,
        xmpProperties: {},
        fields: []
      })
    );
    expect(clean.findings.map((finding) => finding.id)).not.toContain(
      'embedded-attachments'
    );
    expect(clean.findings.map((finding) => finding.id)).not.toContain(
      'javascript'
    );

    const active = normalizeInspectorReport(
      evidence({
        attachments: [
          {
            name: 'notes.txt',
            byteSize: 12,
            description: null,
            source: 'document',
            pageNumber: null
          }
        ],
        javascript: [
          {
            scope: 'document',
            pageNumber: null,
            event: 'OpenAction',
            scriptCount: 1,
            totalCharacters: 24
          }
        ],
        hasJavaScriptActions: true
      })
    );
    expect(active.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'embedded-attachments',
          category: 'privacy-related'
        }),
        expect.objectContaining({
          id: 'javascript',
          category: 'potentially-active'
        })
      ])
    );
  });

  it('keeps raw-only active-token evidence explicitly uncertain', () => {
    const rawOnlyEvidence = evidence({
      metadata: {},
      xmpRaw: null,
      xmpProperties: {},
      fields: []
    });
    rawOnlyEvidence.raw = {
      ...raw,
      markers: raw.markers.map((item) =>
        item.kind === 'launch-action'
          ? { ...item, detected: true, firstByteOffset: 512 }
          : item
      )
    };

    const report = normalizeInspectorReport(rawOnlyEvidence);

    expect(report.findings).toContainEqual(
      expect.objectContaining({
        id: 'raw-active-markers',
        certainty: 'uncertain'
      })
    );
  });

  it('does not overstate raw-only encryption, signature, or XFA tokens', () => {
    const rawOnlyEvidence = evidence({
      metadata: {},
      xmpRaw: null,
      xmpProperties: {},
      fields: [],
      parserFlags: {
        isLinearized: false,
        hasAcroForm: false,
        hasXfa: false,
        hasSignatures: false
      }
    });
    rawOnlyEvidence.raw = {
      ...raw,
      markers: raw.markers.map((item) =>
        ['encryption', 'signature-field', 'xfa-form'].includes(item.kind)
          ? { ...item, detected: true, firstByteOffset: 256 }
          : item
      )
    };

    const report = normalizeInspectorReport(rawOnlyEvidence);

    expect(report.document.encryption.state).toBe('uncertain');
    expect(report.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'signature-fields',
          certainty: 'uncertain'
        }),
        expect.objectContaining({
          id: 'xfa-form',
          certainty: 'uncertain'
        })
      ])
    );
  });
});
