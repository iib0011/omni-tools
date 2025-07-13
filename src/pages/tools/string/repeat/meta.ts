import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  name: 'Repeat text',
  path: 'repeat',
  shortDescription: 'Repeat text multiple times',
  icon: 'material-symbols-light:replay',
  description:
    'This tool allows you to repeat a given text multiple times with an optional separator.',
  keywords: ['text', 'repeat'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string.repeat.name',
    description: 'string.repeat.description',
    shortDescription: 'string.repeat.shortDescription'
  }
});
