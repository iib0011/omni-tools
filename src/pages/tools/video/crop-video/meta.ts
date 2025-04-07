import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Crop Video',
  path: 'crop-video',
  icon: 'mdi:crop',
  description:
    'This online tool lets you crop videos by specifying width, height, and position coordinates. Remove unwanted areas from your videos and keep only the parts you need. Supports common video formats like MP4, WebM, and OGG.',
  shortDescription: 'Crop videos by specifying width, height and position',
  keywords: ['crop', 'video', 'resize', 'trim', 'edit', 'ffmpeg'],
  longDescription:
    'Video cropping is the process of removing unwanted outer areas from a video frame. This tool allows you to specify exact dimensions and coordinates to crop your video, helping you focus on the important parts of your footage or adjust aspect ratios.',
  component: lazy(() => import('./index'))
});
