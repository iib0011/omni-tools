import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Loop Video',
  path: 'loop',
  icon: 'material-symbols:loop',
  description:
    'Create looping video files that repeat continuously. Perfect for background videos, presentations, or creating seamless loops.',
  shortDescription: 'Create looping video files',
  keywords: ['video', 'loop', 'repeat', 'continuous'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:loop.title',
    description: 'video:loop.description',
    shortDescription: 'video:loop.shortDescription'
  }
});
