import { ResourceScope } from './resource-scope';
import { openPdf } from './pdfjs';
import { throwIfAborted } from './errors';

export interface SignatureInspection {
  hasSignatures: boolean;
  fieldNames: string[];
}

export async function inspectSignatureFields(
  data: ArrayBuffer,
  signal?: AbortSignal
): Promise<SignatureInspection> {
  const scope = new ResourceScope();
  try {
    const document = await openPdf(data.slice(0), scope, { signal });
    throwIfAborted(signal);
    const fields = await document.getFieldObjects();
    throwIfAborted(signal);
    const names: string[] = [];

    for (const [name, widgets] of Object.entries(fields ?? {})) {
      throwIfAborted(signal);
      const hasSignature = widgets.some((widget) => {
        const value = widget as Record<string, unknown>;
        return (
          String(value.type ?? '').toLowerCase() === 'signature' ||
          String(value.fieldType ?? '').toLowerCase() === 'sig'
        );
      });
      if (hasSignature) names.push(name);
    }

    if (names.length === 0) {
      for (
        let pageNumber = 1;
        pageNumber <= document.numPages;
        pageNumber += 1
      ) {
        throwIfAborted(signal);
        const page = await document.getPage(pageNumber);
        try {
          const annotations = await page.getAnnotations();
          throwIfAborted(signal);
          for (const annotation of annotations) {
            const value = annotation as Record<string, unknown>;
            if (String(value.fieldType ?? '').toLowerCase() === 'sig') {
              names.push(String(value.fieldName ?? `Page ${pageNumber}`));
            }
          }
        } finally {
          page.cleanup();
        }
      }
    }

    throwIfAborted(signal);
    return { hasSignatures: names.length > 0, fieldNames: [...new Set(names)] };
  } finally {
    await scope.dispose();
  }
}
