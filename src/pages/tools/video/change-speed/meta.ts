import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'change-speed',
  icon: 'material-symbols:speed',

  keywords: ['video', 'speed', 'playback', 'fast', 'slow'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:changeSpeed.title',
    description: 'video:changeSpeed.description',
    shortDescription: 'video:changeSpeed.shortDescription'
  }
});
