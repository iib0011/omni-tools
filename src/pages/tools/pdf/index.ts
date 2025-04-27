import { tool as pdfRotatePdf } from './rotate-pdf/meta';
import { meta as splitPdfMeta } from './split-pdf/meta';
import { meta as mergePdf } from './merge-pdf/meta';
import { DefinedTool } from '@tools/defineTool';

export const pdfTools: DefinedTool[] = [splitPdfMeta, pdfRotatePdf, mergePdf];
