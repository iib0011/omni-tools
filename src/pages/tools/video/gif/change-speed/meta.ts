import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('gif', {
  name: 'Change GIF Speed',
  path: 'change-speed',
  icon: 'material-symbols:speed',
  description:
    'Change the playback speed of GIF animations. Speed up or slow down GIFs while maintaining smooth animation.',
  shortDescription: 'Change GIF animation speed',
  keywords: ['gif', 'speed', 'animation', 'fast', 'slow'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'gif.changeSpeed.title',
    description: 'gif.changeSpeed.description',
    shortDescription: 'gif.changeSpeed.shortDescription'
  }
});
