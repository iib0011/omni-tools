import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'url-decode-string',
  icon: 'codicon:symbol-string',

  keywords: [
    'url',
    'decode',
    'string',
    'url decode',
    'unescape',
    'encoding',
    'percent',
    'decode url'
  ],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:urlDecode.toolInfo.title',
    description: 'string:urlDecode.toolInfo.description',
    shortDescription: 'string:urlDecode.toolInfo.shortDescription',
    longDescription: 'string:urlDecode.toolInfo.longDescription'
  }
});
