import { tool as pdfRotatePdf } from './rotate-pdf/meta';
import { meta as splitPdfMeta } from './split-pdf/meta';
import { tool as compressPdfTool } from './compress-pdf/meta';
import { DefinedTool } from '@tools/defineTool';

export const pdfTools: DefinedTool[] = [
  splitPdfMeta,
  pdfRotatePdf,
  compressPdfTool
];
