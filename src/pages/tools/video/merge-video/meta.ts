import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'merge-video',
  icon: 'fluent:merge-20-regular',
  keywords: ['merge', 'video', 'append', 'combine'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:mergeVideo.title',
    description: 'video:mergeVideo.description',
    shortDescription: 'video:mergeVideo.shortDescription',
    longDescription: 'video:mergeVideo.longDescription'
  }
});
