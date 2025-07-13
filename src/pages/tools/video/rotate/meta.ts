import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Rotate Video',
  path: 'rotate',
  icon: 'material-symbols:rotate-right',
  description:
    'Rotate video files by 90, 180, or 270 degrees. Correct video orientation or create special effects with precise rotation control.',
  shortDescription: 'Rotate video by specified degrees',
  keywords: ['video', 'rotate', 'orientation', 'degrees'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video.rotate.name',
    description: 'video.rotate.description',
    shortDescription: 'video.rotate.shortDescription'
  }
});
