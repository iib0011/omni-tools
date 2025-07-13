import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  name: 'Text Statistics',
  path: 'statistics',
  shortDescription: 'Get statistics about your text',
  icon: 'fluent:document-landscape-data-24-filled',
  description:
    'Load your text in the input form on the left and you will automatically get statistics about your text on the right.',
  longDescription:
    'This tool provides various statistics about the text you input, including the number of lines, words, and characters. You can also choose to include empty lines in the count. it can count words and characters based on custom delimiters, allowing for flexible text analysis. Additionally, it can provide frequency statistics for words and characters, helping you understand the distribution of terms in your text.',
  keywords: ['text', 'statistics', 'count', 'lines', 'words', 'characters'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:statistic.title',
    description: 'string:statistic.description',
    shortDescription: 'string:statistic.shortDescription',
    longDescription: 'string:statistic.longDescription'
  }
});
