import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Change speed',
  path: 'change-speed',
  icon: 'material-symbols-light:speed-outline',
  description:
    'This online utility lets you change the speed of a video. You can speed it up or slow it down.',
  shortDescription: 'Quickly change video speed',
  keywords: ['change', 'speed'],
  component: lazy(() => import('./index'))
});
