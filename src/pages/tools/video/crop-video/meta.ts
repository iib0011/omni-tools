import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'crop-video',
  icon: 'material-symbols:crop',

  keywords: ['video', 'crop', 'trim', 'edit', 'resize'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:cropVideo.title',
    description: 'video:cropVideo.description',
    shortDescription: 'video:cropVideo.shortDescription'
  }
});
