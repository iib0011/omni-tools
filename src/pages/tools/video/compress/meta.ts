import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Compress video',
  path: 'compress',
  icon: 'material-symbols:compress',
  description:
    'Reduce video file size while maintaining quality. Compress videos for easier sharing, uploading, or storage.',
  shortDescription: 'Compress video files to reduce size (MP4, MOV, AVI).',
  keywords: [
    'compress',
    'video',
    'reduce',
    'size',
    'optimize',
    'mp4',
    'mov',
    'avi',
    'video editing',
    'shrink'
  ],
  longDescription:
    'This tool allows you to compress video files to reduce their size while maintaining acceptable quality. Useful for sharing videos via email, uploading to websites with size limits, or saving storage space. Supports various video formats including MP4, MOV, and AVI. You can adjust compression settings to balance file size and quality.',
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
