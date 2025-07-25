import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'crontab-guru',
  icon: 'material-symbols:schedule',
  keywords: [
    'crontab',
    'cron',
    'schedule',
    'guru',
    'time',
    'expression',
    'parser',
    'explain'
  ],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time:crontabGuru.title',
    description: 'time:crontabGuru.description',
    shortDescription: 'time:crontabGuru.shortDescription',
    userTypes: ['developers']
  }
});
