import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Crontab Guru',
  path: 'crontab-guru',
  icon: 'material-symbols:schedule',
  description:
    'Generate and understand cron expressions. Create cron schedules for automated tasks and system jobs.',
  shortDescription: 'Generate and understand cron expressions',
  keywords: ['cron', 'schedule', 'automation', 'expression'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time:crontabGuru.title',
    description: 'time:crontabGuru.description',
    shortDescription: 'time:crontabGuru.shortDescription'
  }
});
