import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('xml', {
  path: 'xml-beautifier',
  icon: 'material-symbols:code',

  keywords: ['xml', 'beautify', 'format', 'code', 'indent'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'xml:xmlBeautifier.title',
    description: 'xml:xmlBeautifier.description',
    shortDescription: 'xml:xmlBeautifier.shortDescription'
  }
});
