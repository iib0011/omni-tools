import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Video to Gif',
  path: 'video-to-gif',
  icon: 'fluent:gif-16-regular',
  description: 'This online utility lets you convert a short video to gif.',
  shortDescription: 'Quickly convert a short video to gif',
  keywords: ['video', 'to', 'gif', 'convert'],
  component: lazy(() => import('./index'))
});
