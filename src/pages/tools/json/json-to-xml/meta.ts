import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  path: 'json-to-xml',
  icon: 'material-symbols:code',

  keywords: ['json', 'xml', 'convert', 'transform'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:jsonToXml.title',
    description: 'json:jsonToXml.description',
    shortDescription: 'json:jsonToXml.shortDescription'
  }
});
