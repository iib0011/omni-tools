import { describe, it, expect } from 'vitest';
import type { TFunction } from 'i18next';
import { filterTools } from './index';
import type { DefinedTool } from './defineTool';
import type { FullI18nKey, I18nNamespaces } from '../i18n';

const mergePdfTool = {
  type: 'pdf',
  path: 'pdf/merge-pdf',
  name: 'pdf:mergePdf.title' as FullI18nKey,
  description: 'pdf:mergePdf.description' as FullI18nKey,
  shortDescription: 'pdf:mergePdf.shortDescription' as FullI18nKey,
  icon: 'icon',
  keywords: ['pdf', 'merge', 'extract', 'pages', 'combine', 'document'],
  component: (() => null) as unknown,
  userTypes: ['generalUsers']
} as unknown as DefinedTool;

const base64Tool = {
  type: 'string',
  path: 'string/base64',
  name: 'string:base64.title' as FullI18nKey,
  description: 'string:base64.description' as FullI18nKey,
  shortDescription: 'string:base64.shortDescription' as FullI18nKey,
  icon: 'icon',
  keywords: ['base64'],
  component: (() => null) as unknown,
  userTypes: ['generalUsers', 'developers']
} as unknown as DefinedTool;

type NamespacedT = TFunction<I18nNamespaces[]>;

const enTranslations: Record<string, string> = {
  'pdf:mergePdf.title': 'Merge PDF',
  'pdf:mergePdf.description': 'Merge multiple PDF files into one document',
  'pdf:mergePdf.shortDescription': 'Merge PDF files',
  'string:base64.title': 'Base64 Encoder/Decoder',
  'string:base64.description': 'Encode or decode Base64 text',
  'string:base64.shortDescription': 'Convert text to and from Base64'
};

const esTranslations: Record<string, string> = {
  'pdf:mergePdf.title': 'Unir PDF',
  'pdf:mergePdf.description': 'Unir varios archivos PDF en un solo documento',
  'pdf:mergePdf.shortDescription': 'Unir archivos PDF'
};

const makeT = (dict: Record<string, string>): NamespacedT =>
  ((key: string) => dict[key] ?? key) as unknown as NamespacedT;

describe('filterTools token-based search (Phase 1)', () => {
  const tools = [mergePdfTool, base64Tool];
  const tEn = makeT(enTranslations);
  const tEs = makeT(esTranslations);

  it('returns all tools when query is empty or whitespace', () => {
    expect(filterTools(tools, '', [], tEn)).toEqual(tools);
    expect(filterTools(tools, '   ', [], tEn)).toEqual(tools);
  });

  it('matches tools regardless of word order and extra whitespace', () => {
    const result1 = filterTools(tools, 'pdf merge', [], tEn);
    const result2 = filterTools(tools, '   merge   pdf  ', [], tEn);

    expect(result1).toContain(mergePdfTool);
    expect(result2).toContain(mergePdfTool);
  });

  it('matches base64 tool with different queries and is case-insensitive', () => {
    expect(filterTools(tools, 'Base64', [], tEn)).toContain(base64Tool);
    expect(filterTools(tools, 'base64 encoder', [], tEn)).toContain(base64Tool);
  });

  it('ignores trailing spaces', () => {
    const result = filterTools(tools, 'pdf merge   ', [], tEn);
    expect(result).toContain(mergePdfTool);
  });

  it('works with non-English localized strings', () => {
    const result = filterTools(tools, 'unir pdf', [], tEs);
    expect(result).toContain(mergePdfTool);
  });
});
