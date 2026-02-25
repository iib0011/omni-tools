import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'resize',
  icon: 'material-symbols:aspect-ratio',

  keywords: ['video', 'rotate', 'orientation', 'degrees'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:resize.title',
    description: 'video:resize.description',
    shortDescription: 'video:resize.shortDescription',
    userTypes: ['generalUsers']
  }
});
