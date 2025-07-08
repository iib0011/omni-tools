import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Crontab explainer',
  path: 'crontab-guru',
  icon: 'mdi:calendar-clock',
  description:
    'Parse, validate, and explain crontab expressions in plain English.',
  shortDescription: 'Crontab expression parser and explainer',
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
  longDescription:
    'Enter a crontab expression (like "35 16 * * 0-5") to get a human-readable explanation and validation. Useful for understanding and debugging cron schedules. Inspired by crontab.guru.',
  component: lazy(() => import('./index'))
});
