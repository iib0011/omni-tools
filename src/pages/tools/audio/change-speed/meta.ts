import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('audio', {
  name: 'Change audio speed',
  path: 'change-speed',
  icon: 'material-symbols-light:speed-outline',
  description:
    'This online utility lets you change the speed of an audio. You can speed it up or slow it down.',
  shortDescription: 'Quickly change audio speed',
  keywords: ['change', 'speed'],
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
