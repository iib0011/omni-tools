import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Crop video',
  path: 'crop-video',
  icon: 'mdi:crop',
  description: 'Crop a video by specifying coordinates and dimensions',
  shortDescription: 'Crop video to specific area',
  keywords: ['crop', 'video', 'trim', 'cut', 'resize'],
  longDescription:
    'Remove unwanted parts from the edges of your video by cropping it to a specific rectangular area. Define the starting coordinates (X, Y) and the width and height of the area you want to keep.',
  component: lazy(() => import('./index'))
});
