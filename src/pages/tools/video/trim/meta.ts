import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Trim video',
  path: 'trim',
  icon: 'material-symbols:content-cut',
  description:
    'Cut and trim video files to extract specific segments by specifying start and end times.',
  shortDescription:
    'Trim video files to extract specific time segments (MP4, MOV, AVI).',
  keywords: [
    'trim',
    'video',
    'cut',
    'segment',
    'extract',
    'mp4',
    'mov',
    'avi',
    'video editing',
    'time'
  ],
  longDescription:
    'This tool allows you to trim video files by specifying start and end times. You can extract specific segments from longer videos, remove unwanted parts, or create shorter clips. Supports various video formats including MP4, MOV, and AVI. Perfect for video editing, content creation, or any video processing needs.',
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
