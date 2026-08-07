import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('converters', {
  path: 'video-to-gif',
  icon: 'material-symbols:gif',
  keywords: ['video', 'gif', 'convert', 'animated', 'image'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'converters:videoToGif.title',
    description: 'converters:videoToGif.description',
    shortDescription: 'converters:videoToGif.shortDescription',
    userTypes: ['generalUsers']
  }
});
