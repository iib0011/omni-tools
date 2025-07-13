import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'JSON to XML',
  path: 'json-to-xml',
  icon: 'material-symbols:code',
  description:
    'Convert JSON data to XML format. Transform structured JSON objects into well-formed XML documents.',
  shortDescription: 'Convert JSON to XML format',
  keywords: ['json', 'xml', 'convert', 'transform'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:jsonToXml.title',
    description: 'json:jsonToXml.description',
    shortDescription: 'json:jsonToXml.shortDescription'
  }
});
