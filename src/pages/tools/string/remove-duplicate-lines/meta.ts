import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  name: 'Remove duplicate lines',
  path: 'remove-duplicate-lines',
  icon: 'pepicons-print:duplicate-off',
  description:
    "Load your text in the input form on the left and you'll instantly get text with no duplicate lines in the output area. Powerful, free, and fast. Load text lines – get unique text lines",
  shortDescription: 'Quickly delete all repeated lines from text',
  keywords: ['remove', 'duplicate', 'lines'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string.removeDuplicateLines.name',
    description: 'string.removeDuplicateLines.description',
    shortDescription: 'string.removeDuplicateLines.shortDescription'
  }
});
