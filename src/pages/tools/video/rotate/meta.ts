import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Rotate video',
  path: 'rotate',
  icon: 'material-symbols:rotate-right',
  description:
    'Rotate video files by 90, 180, or 270 degrees. Fix incorrectly oriented videos or create rotated content.',
  shortDescription:
    'Rotate video files by 90, 180, or 270 degrees (MP4, MOV, AVI).',
  keywords: [
    'rotate',
    'video',
    'orientation',
    'mp4',
    'mov',
    'avi',
    'video editing',
    'flip'
  ],
  longDescription:
    'This tool allows you to rotate video files by 90, 180, or 270 degrees. Useful for fixing incorrectly oriented videos (like those recorded with phones), creating rotated content, or adjusting video orientation for different platforms. Supports various video formats including MP4, MOV, and AVI.',
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
