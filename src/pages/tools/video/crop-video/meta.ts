import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Crop Video',
  path: 'crop-video',
  icon: 'material-symbols:crop',
  description:
    'Crop video files to remove unwanted areas or focus on specific content. Specify crop dimensions and position to create custom video compositions.',
  shortDescription: 'Crop video to remove unwanted areas',
  keywords: ['video', 'crop', 'trim', 'edit', 'resize'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:cropVideo.title',
    description: 'video:cropVideo.description',
    shortDescription: 'video:cropVideo.shortDescription'
  }
});
