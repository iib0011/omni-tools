import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('gif', {
  name: 'Change speed',
  path: 'change-speed',
  // image,
  description:
    'This online utility lets you change the speed of a GIF animation. You can speed it up or slow it down. You can set the same constant delay between all frames or change the delays of individual frames. You can also play both the input and output GIFs at the same time and compare their speeds',
  shortDescription: '',
  keywords: ['change', 'speed'],
  component: lazy(() => import('./index'))
});
