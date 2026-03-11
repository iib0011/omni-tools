import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  i18n: {
    name: 'string:slugGenerator.title',
    description: 'string:slugGenerator.description',
    shortDescription: 'string:slugGenerator.shortDescription',
    longDescription: 'string:slugGenerator.longDescription'
  },
  path: 'slug-generator',
  icon: 'solar:link-bold-duotone',
  keywords: ['slug', 'generator', 'url', 'seo'],
  component: lazy(() => import('./index'))
});
