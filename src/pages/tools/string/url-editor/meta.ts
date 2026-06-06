import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'url-editor',
  icon: 'mdi:link-edit',

  keywords: [
    'url',
    'editor',
    'query',
    'parameters',
    'parse',
    'link',
    'href',
    'search params'
  ],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:urlEditor.toolInfo.title',
    description: 'string:urlEditor.toolInfo.description',
    shortDescription: 'string:urlEditor.toolInfo.shortDescription',
    longDescription: 'string:urlEditor.toolInfo.longDescription'
  }
});
