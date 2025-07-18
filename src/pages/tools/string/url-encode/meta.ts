import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'url-encode-string',
  icon: 'ic:baseline-percentage',

  keywords: ['uppercase'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:urlEncode.toolInfo.title',
    description: 'string:urlEncode.toolInfo.description',
    shortDescription: 'string:urlEncode.toolInfo.shortDescription',
    longDescription: 'string:urlEncode.toolInfo.longDescription'
  }
});
