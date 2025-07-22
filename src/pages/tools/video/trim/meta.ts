import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('video', {
  path: 'trim',
  icon: 'material-symbols:content-cut',
  keywords: ['video', 'trim', 'cut', 'edit', 'time'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'video:trim.title',
    description: 'video:trim.description',
    shortDescription: 'video:trim.shortDescription',
    userTypes: ['General Users']
  }
});
