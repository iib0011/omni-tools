import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'censor',

  icon: 'hugeicons:text-footnote',

  keywords: ['text', 'censor', 'words', 'characters'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:censor.title',
    description: 'string:censor.description',
    shortDescription: 'string:censor.shortDescription',
    userTypes: ['General Users', 'Students']
  }
});
