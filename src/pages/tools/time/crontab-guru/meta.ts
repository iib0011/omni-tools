import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'crontab-guru',
  icon: 'material-symbols:schedule',

  keywords: ['cron', 'schedule', 'automation', 'expression'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time:crontabGuru.title',
    description: 'time:crontabGuru.description',
    shortDescription: 'time:crontabGuru.shortDescription'
  }
});
