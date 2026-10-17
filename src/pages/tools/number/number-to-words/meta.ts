import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('number', {
  path: 'number-to-words',
  icon: 'fluent:text-number-format-24-regular',

  keywords: ['number', 'words', 'spell', 'text', 'convert', 'cheque'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'number:numberToWords.title',
    description: 'number:numberToWords.description',
    shortDescription: 'number:numberToWords.shortDescription',
    userTypes: ['generalUsers']
  }
});
