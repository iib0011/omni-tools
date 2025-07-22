import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'video-to-gif',
  icon: 'material-symbols:gif',
  keywords: ['video', 'gif', 'convert', 'animated', 'image'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:videoToGif.title',
    description: 'video:videoToGif.description',
    shortDescription: 'video:videoToGif.shortDescription',
    userTypes: ['General Users']
  }
});
