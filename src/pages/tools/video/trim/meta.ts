import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  name: 'Trim Video',
  path: 'trim',
  icon: 'material-symbols:content-cut',
  description:
    'Trim video files by specifying start and end times. Remove unwanted sections from the beginning or end of videos.',
  shortDescription: 'Trim video by removing unwanted sections',
  keywords: ['video', 'trim', 'cut', 'edit', 'time'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:trim.title',
    description: 'video:trim.description',
    shortDescription: 'video:trim.shortDescription'
  }
});
