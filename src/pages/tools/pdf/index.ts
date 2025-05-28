import { tool as pdfRotatePdf } from './rotate-pdf/meta';
import { meta as splitPdfMeta } from './split-pdf/meta';
import { meta as mergePdf } from './merge-pdf/meta';
import { DefinedTool } from '@tools/defineTool';
import { tool as compressPdfTool } from './compress-pdf/meta';
import { tool as protectPdfTool } from './protect-pdf/meta';
import { meta as pdfToEpub } from './pdf-to-epub/meta';

export const pdfTools: DefinedTool[] = [
  splitPdfMeta,
  pdfRotatePdf,
  compressPdfTool,
  protectPdfTool,
  mergePdf,
  pdfToEpub
];
