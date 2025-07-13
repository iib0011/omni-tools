import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('xml', {
  name: 'XML Validator',
  path: 'xml-validator',
  icon: 'material-symbols:check-circle',
  description:
    'Validate XML code for syntax errors and well-formed structure. Check if XML documents follow proper formatting rules.',
  shortDescription: 'Validate XML code for errors',
  keywords: ['xml', 'validate', 'check', 'syntax', 'errors'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'xml.xmlValidator.name',
    description: 'xml.xmlValidator.description',
    shortDescription: 'xml.xmlValidator.shortDescription'
  }
});
