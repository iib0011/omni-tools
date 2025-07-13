import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('xml', {
  name: 'XML Beautifier',
  path: 'xml-beautifier',
  icon: 'material-symbols:code',
  description:
    'Format and beautify XML code with proper indentation and spacing. Make XML files more readable and organized.',
  shortDescription: 'Format and beautify XML code',
  keywords: ['xml', 'beautify', 'format', 'code', 'indent'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'xml.xmlBeautifier.name',
    description: 'xml.xmlBeautifier.description',
    shortDescription: 'xml.xmlBeautifier.shortDescription'
  }
});
