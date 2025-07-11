import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('xml', {
  name: 'XML Beautifier',
  path: 'xml-beautifier',
  icon: 'mdi:format-align-left',
  description:
    'Beautify and reformat XML for improved readability and structure.',
  shortDescription: 'Beautify XML for readability.',
  keywords: ['xml', 'beautify', 'format', 'pretty', 'indent'],
  component: lazy(() => import('./index'))
});
