import {
  FindingCategory,
  FormInspection,
  InspectorEvidence,
  InspectorFinding,
  InspectorReport,
  PageAction,
  PageLink,
  RawMarkerEvidence,
  SignatureFieldInspection
} from './types';

export const LOW_TEXT_CHARACTER_THRESHOLD = 32;

function marker(
  evidence: InspectorEvidence,
  kind: RawMarkerEvidence['kind']
): RawMarkerEvidence {
  return (
    evidence.raw.markers.find((item) => item.kind === kind) ?? {
      kind,
      detected: false,
      firstByteOffset: null
    }
  );
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((left, right) =>
    left.localeCompare(right)
  );
}

function uniqueNumbers(values: number[]): number[] {
  return Array.from(new Set(values)).sort((left, right) => left - right);
}

function uniqueLinks(links: PageLink[]): PageLink[] {
  const seen = new Set<string>();
  return links
    .filter((link) => {
      const key = `${link.source}:${link.pageNumber}:${link.target}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort(
      (left, right) =>
        (left.pageNumber ?? 0) - (right.pageNumber ?? 0) ||
        left.target.localeCompare(right.target)
    );
}

function uniqueActions(actions: PageAction[]): PageAction[] {
  const seen = new Set<string>();
  return actions.filter((action) => {
    const key = `${action.source}:${action.pageNumber ?? 'document'}:${
      action.type
    }`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function signatureFields(fields: FormInspection[]): SignatureFieldInspection[] {
  return fields
    .filter((field) => field.type.toLowerCase() === 'signature')
    .map((field) => ({
      name: field.name,
      widgetCount: field.widgetCount,
      pageNumbers: field.pageNumbers,
      note: 'A signature field was identified. This inspector does not validate a digital signature or its trust chain.'
    }));
}

function aggregateAnnotations(
  evidence: InspectorEvidence
): InspectorReport['annotations'] {
  const byType: Record<string, number> = {};
  let total = 0;

  for (const page of evidence.pages) {
    total += page.annotationCount;
    for (const [type, count] of Object.entries(page.annotationsByType)) {
      byType[type] = (byType[type] ?? 0) + count;
    }
  }

  return {
    total,
    byType: Object.fromEntries(
      Object.entries(byType).sort(([left], [right]) =>
        left.localeCompare(right)
      )
    )
  };
}

function buildFindings(
  evidence: InspectorEvidence,
  links: PageLink[],
  actions: PageAction[],
  signatures: SignatureFieldInspection[],
  annotationTotal: number
): InspectorFinding[] {
  const findings: InspectorFinding[] = [];
  const metadataKeys = Object.keys(evidence.document.metadata);
  const rawActiveMarkers = evidence.raw.markers.filter(
    (item) =>
      item.detected &&
      [
        'javascript',
        'open-action',
        'launch-action',
        'additional-actions',
        'submit-form',
        'import-data',
        'remote-document'
      ].includes(item.kind)
  );
  const lowTextPages = evidence.pages
    .filter((page) => page.lowExtractableText)
    .map((page) => page.pageNumber);
  const rawSignatureMarker = marker(evidence, 'signature-field');
  const rawXfaMarker = marker(evidence, 'xfa-form');

  findings.push({
    id: 'document-summary',
    category: 'informational',
    certainty: 'confirmed',
    title: 'Document structure',
    summary: `${evidence.document.pageCount} page${
      evidence.document.pageCount === 1 ? '' : 's'
    } parsed with PDF.js.`,
    evidence: [
      evidence.document.pdfVersion
        ? `Reported PDF version: ${evidence.document.pdfVersion}`
        : 'PDF version was not exposed conclusively by the parser.'
    ]
  });

  if (metadataKeys.length > 0 || evidence.document.xmpRaw) {
    findings.push({
      id: 'document-metadata',
      category: 'privacy-related',
      certainty: 'confirmed',
      title: 'Document metadata is present',
      summary:
        'Metadata can contain authoring, software, organization, or timestamp information.',
      evidence: [
        `${metadataKeys.length} document-information field(s)`,
        evidence.document.xmpRaw
          ? 'An XMP metadata packet is present.'
          : 'No XMP packet was exposed.'
      ]
    });
  }

  if (evidence.document.attachments.length > 0) {
    findings.push({
      id: 'embedded-attachments',
      category: 'privacy-related',
      certainty: 'confirmed',
      title: 'Embedded attachments are present',
      summary:
        'Embedded files may contain information beyond the visible PDF pages.',
      evidence: evidence.document.attachments.map((attachment) =>
        attachment.byteSize === null
          ? attachment.name
          : `${attachment.name} (${attachment.byteSize} bytes)`
      )
    });
  }

  const externalLinks = links.filter((link) => link.external);
  if (externalLinks.length > 0) {
    findings.push({
      id: 'external-links',
      category: 'potentially-active',
      certainty: 'confirmed',
      title: 'External link targets are present',
      summary:
        'Opening an external target can leave the browser and disclose network information.',
      evidence: externalLinks.map(
        (link) =>
          `${
            link.pageNumber ? `Page ${link.pageNumber}` : 'Document outline'
          }: ${link.target}`
      ),
      pageNumbers: uniqueNumbers(
        externalLinks.flatMap((link) =>
          link.pageNumber === null ? [] : [link.pageNumber]
        )
      )
    });
  }

  if (
    evidence.document.javascript.length > 0 ||
    evidence.document.hasJavaScriptActions
  ) {
    findings.push({
      id: 'javascript',
      category: 'potentially-active',
      certainty: 'confirmed',
      title: 'JavaScript actions were exposed by PDF.js',
      summary:
        'The inspector reports script events and sizes but does not execute the scripts.',
      evidence: evidence.document.javascript.map(
        (item) =>
          `${item.scope}${
            item.pageNumber ? ` page ${item.pageNumber}` : ''
          }, event ${item.event}: ${item.scriptCount} script(s)`
      )
    });
  }

  if (evidence.document.openActionPresent) {
    findings.push({
      id: 'open-action',
      category: 'potentially-active',
      certainty: 'confirmed',
      title: 'A document-open action or destination is present',
      summary:
        'PDF.js exposed an action or destination associated with opening the document.',
      evidence: ['PDF.js getOpenAction() returned a value.']
    });
  }

  if (actions.length > 0) {
    findings.push({
      id: 'other-actions',
      category: 'potentially-active',
      certainty: 'confirmed',
      title: 'Additional PDF actions are present',
      summary:
        'Actions can ask a viewer to navigate, submit data, launch a target, or perform another operation.',
      evidence: actions.map(
        (action) =>
          `${action.source}${
            action.pageNumber ? ` page ${action.pageNumber}` : ''
          }: ${action.type}`
      )
    });
  }

  if (rawActiveMarkers.length > 0) {
    findings.push({
      id: 'raw-active-markers',
      category: 'potentially-active',
      certainty: 'uncertain',
      title: 'Raw active-content tokens were observed',
      summary:
        'The byte scan found action-related tokens. They can support parsed findings, but raw matches are not conclusive by themselves.',
      evidence: rawActiveMarkers.map(
        (item) =>
          `${item.kind} token near byte ${item.firstByteOffset ?? 'unknown'}`
      )
    });
  }

  if (
    evidence.document.fields.length > 0 ||
    evidence.document.parserFlags.hasAcroForm === true
  ) {
    findings.push({
      id: 'forms',
      category: 'informational',
      certainty:
        evidence.document.fields.length > 0 ? 'confirmed' : 'uncertain',
      title: 'Interactive form fields are present',
      summary:
        evidence.document.fields.length > 0
          ? `${evidence.document.fields.length} named form field(s) were exposed.`
          : 'PDF.js reported an AcroForm but did not expose named field details.',
      evidence:
        evidence.document.fields.length > 0
          ? evidence.document.fields.map(
              (field) =>
                `${field.name}: ${field.type} (${field.widgetCount} widget${
                  field.widgetCount === 1 ? '' : 's'
                })`
            )
          : ['PDF.js document information: IsAcroFormPresent = true']
    });
  }

  if (
    signatures.length > 0 ||
    evidence.document.parserFlags.hasSignatures === true ||
    rawSignatureMarker.detected
  ) {
    const parsedSignatureEvidence =
      signatures.length > 0 ||
      evidence.document.parserFlags.hasSignatures === true;
    findings.push({
      id: 'signature-fields',
      category: 'informational',
      certainty: parsedSignatureEvidence ? 'confirmed' : 'uncertain',
      title: 'Signature fields are present',
      summary:
        'Field presence does not establish that a signature is valid, trusted, or unchanged.',
      evidence:
        signatures.length > 0
          ? signatures.map((field) => field.name)
          : evidence.document.parserFlags.hasSignatures === true
            ? [
                'PDF.js reported signature fields without exposing field details.'
              ]
            : [
                `A raw /FT /Sig token was found near byte ${
                  rawSignatureMarker.firstByteOffset ?? 'unknown'
                }; PDF.js did not confirm a signature field.`
              ],
      pageNumbers: uniqueNumbers(
        signatures.flatMap((field) => field.pageNumbers)
      )
    });
  }

  if (evidence.document.parserFlags.hasXfa === true || rawXfaMarker.detected) {
    findings.push({
      id: 'xfa-form',
      category: 'informational',
      certainty:
        evidence.document.parserFlags.hasXfa === true
          ? 'confirmed'
          : 'uncertain',
      title: 'XFA form content is present',
      summary:
        'PDF.js reported an XFA form. Field coverage can differ from ordinary AcroForm fields.',
      evidence:
        evidence.document.parserFlags.hasXfa === true
          ? ['PDF.js document information: IsXFAPresent = true']
          : [
              `A raw /XFA token was found near byte ${
                rawXfaMarker.firstByteOffset ?? 'unknown'
              }; PDF.js did not confirm an XFA form.`
            ]
    });
  }

  if (annotationTotal > 0) {
    findings.push({
      id: 'annotations',
      category: 'informational',
      certainty: 'confirmed',
      title: 'Annotations are present',
      summary: `${annotationTotal} annotation${
        annotationTotal === 1 ? '' : 's'
      } were exposed across the document.`,
      evidence: ['Annotation appearances and intent can vary by PDF viewer.']
    });
  }

  if (lowTextPages.length > 0) {
    findings.push({
      id: 'low-text-pages',
      category: 'informational',
      certainty: 'likely',
      title: 'Some pages have little or no extractable text',
      summary:
        'These pages may be image-based, sparsely labeled, or use text encodings the parser cannot expose.',
      evidence: [`Pages: ${lowTextPages.join(', ')}`],
      pageNumbers: lowTextPages
    });
  }

  return findings;
}

export function normalizeInspectorReport(
  evidence: InspectorEvidence
): InspectorReport {
  const encryptionMarker = marker(evidence, 'encryption');
  const linearizationMarker = marker(evidence, 'linearization');
  const encryptionConfirmed =
    evidence.document.passwordRequired ||
    evidence.document.permissions.exposed ||
    Boolean(evidence.document.encryptionFilter);
  const encryptionState = encryptionConfirmed
    ? 'detected'
    : encryptionMarker.detected
      ? 'uncertain'
      : 'not-detected';
  const encryptionEvidence: string[] = [];
  if (evidence.document.passwordRequired) {
    encryptionEvidence.push('A password challenge occurred while parsing.');
  }
  if (evidence.document.permissions.exposed) {
    encryptionEvidence.push('PDF.js exposed document permission flags.');
  }
  if (evidence.document.encryptionFilter) {
    encryptionEvidence.push(
      `PDF.js reported encryption filter: ${evidence.document.encryptionFilter}.`
    );
  }
  if (encryptionMarker.detected) {
    encryptionEvidence.push(
      `A raw /Encrypt token was found near byte ${
        encryptionMarker.firstByteOffset ?? 'unknown'
      }.`
    );
  }
  if (encryptionEvidence.length === 0) {
    encryptionEvidence.push(
      'No password challenge, permission flags, or raw /Encrypt token was detected.'
    );
  }

  const annotations = aggregateAnnotations(evidence);
  const links = uniqueLinks([
    ...evidence.pages.flatMap((page) => page.links),
    ...evidence.document.outlineLinks
  ]);
  const actions = uniqueActions(evidence.pages.flatMap((page) => page.actions));
  const signatures = signatureFields(evidence.document.fields);
  const totalExtractableCharacters = evidence.pages.reduce(
    (sum, page) => sum + page.extractableTextCharacters,
    0
  );
  const lowTextPages = evidence.pages
    .filter((page) => page.lowExtractableText)
    .map((page) => page.pageNumber);
  const fontNames = uniqueSorted(
    evidence.pages.flatMap((page) => page.approximateFontNames)
  );
  const imagePaintOperations = evidence.pages.reduce(
    (sum, page) => sum + page.imagePaintOperations,
    0
  );
  const activeRawMarkers = evidence.raw.markers.filter(
    (item) =>
      item.detected &&
      [
        'javascript',
        'open-action',
        'launch-action',
        'additional-actions',
        'submit-form',
        'import-data',
        'remote-document'
      ].includes(item.kind)
  );
  const findings = buildFindings(
    evidence,
    links,
    actions,
    signatures,
    annotations.total
  );
  const categories: FindingCategory[] = [
    'informational',
    'privacy-related',
    'potentially-active'
  ];

  return {
    schemaVersion: '1.0',
    generatedAt: evidence.generatedAt,
    scopeStatement:
      'This browser-only report describes what PDF.js and a limited raw-token scan could observe. It is not a malware scan, signature validation, compliance validation, or security guarantee.',
    file: evidence.file,
    parser: {
      name: 'PDF.js',
      version: evidence.pdfJsVersion,
      rawStructureScan:
        'The supplemental byte scan looks for selected uncompressed PDF tokens and computes SHA-256 with Web Crypto.'
    },
    document: {
      pdfVersion: evidence.document.pdfVersion ?? evidence.raw.headerVersion,
      pageCount: evidence.document.pageCount,
      passwordRequired: evidence.document.passwordRequired,
      encryption: {
        state: encryptionState,
        filter: evidence.document.encryptionFilter,
        evidence: encryptionEvidence
      },
      linearization: {
        state:
          evidence.document.parserFlags.isLinearized === true
            ? 'appears-linearized'
            : evidence.document.parserFlags.isLinearized === false &&
                linearizationMarker.detected
              ? 'uncertain'
              : linearizationMarker.detected
                ? 'appears-linearized'
                : 'not-detected',
        evidence: [
          evidence.document.parserFlags.isLinearized === null
            ? 'PDF.js did not expose a conclusive linearization flag.'
            : `PDF.js reported IsLinearized = ${evidence.document.parserFlags.isLinearized}.`,
          linearizationMarker.detected
            ? `A /Linearized token appears near byte ${
                linearizationMarker.firstByteOffset ?? 'unknown'
              }.`
            : 'No /Linearized token was found near the beginning of the file.'
        ]
      },
      permissions: evidence.document.permissions
    },
    metadata: {
      documentInfo: evidence.document.metadata,
      xmp: {
        present:
          Boolean(evidence.document.xmpRaw) ||
          Object.keys(evidence.document.xmpProperties).length > 0,
        raw: evidence.document.xmpRaw,
        properties: evidence.document.xmpProperties
      }
    },
    pages: evidence.pages,
    text: {
      totalExtractableCharacters,
      lowTextThreshold: LOW_TEXT_CHARACTER_THRESHOLD,
      lowTextPages,
      note: 'Counts cover text strings extractable through the PDF.js text API; they are not OCR results.'
    },
    forms: {
      fields: evidence.document.fields,
      signatureFields: signatures,
      parserFlags: evidence.document.parserFlags
    },
    annotations,
    links: {
      all: links,
      externalTargets: links.filter((link) => link.external),
      note: 'Targets are reported as text only. The inspector does not open or request them.'
    },
    attachments: evidence.document.attachments,
    activeContent: {
      javascript: evidence.document.javascript,
      openActionPresent: evidence.document.openActionPresent,
      actionTypes: actions,
      rawMarkers: activeRawMarkers,
      note: 'Scripts and actions are enumerated but not executed. Raw-only markers may be false positives or miss encoded objects.'
    },
    resources: {
      imagePaintOperations,
      approximateFontNames: fontNames,
      note: 'Image numbers count PDF.js paint operations, not unique embedded files. Font names come from text styles used on parsed pages and may be substituted or incomplete.'
    },
    findings,
    findingsByCategory: Object.fromEntries(
      categories.map((category) => [
        category,
        findings.filter((finding) => finding.category === category)
      ])
    ) as Record<FindingCategory, InspectorFinding[]>,
    uncertainties: uniqueSorted([
      ...evidence.raw.notes,
      ...evidence.uncertainties,
      'Encrypted content cannot be fully inspected without a correct password.',
      'Raw token scanning cannot conclusively identify content stored in compressed or encoded object streams.',
      'The browser parser does not validate digital signatures, certificates, trust chains, revocation, malware, or standards compliance.'
    ])
  };
}
