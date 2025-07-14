import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('gif', {
  path: 'change-speed',
  icon: 'material-symbols:speed',

  keywords: ['gif', 'speed', 'animation', 'fast', 'slow'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:gif.changeSpeed.title',
    description: 'video:gif.changeSpeed.description',
    shortDescription: 'video:gif.changeSpeed.shortDescription'
  }
});
