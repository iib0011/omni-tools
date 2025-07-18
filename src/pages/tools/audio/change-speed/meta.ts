import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('audio', {
  path: 'change-speed',
  icon: 'material-symbols:speed',

  keywords: [
    'audio',
    'speed',
    'tempo',
    'playback',
    'accelerate',
    'slow down',
    'pitch',
    'media'
  ],

  component: lazy(() => import('./index')),
  i18n: {
    name: 'audio:changeSpeed.title',
    description: 'audio:changeSpeed.description',
    shortDescription: 'audio:changeSpeed.shortDescription',
    userTypes: ['General Users', 'Students', 'Developers']
  }
});
