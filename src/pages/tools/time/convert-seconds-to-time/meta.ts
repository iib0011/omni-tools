import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'convert-seconds-to-time',
  icon: 'material-symbols:schedule',

  keywords: ['seconds', 'time', 'convert', 'format'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time:convertSecondsToTime.title',
    description: 'time:convertSecondsToTime.description',
    shortDescription: 'time:convertSecondsToTime.shortDescription',
    userTypes: ['General Users']
  }
});
