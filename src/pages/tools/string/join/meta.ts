import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  name: 'Join',
  path: 'join',
  icon: 'material-symbols-light:join',
  description:
    "World's simplest browser-based utility for joining text elements. Input your text elements and specify a separator to combine them into a single string. Perfect for data processing, text manipulation, or creating formatted output from lists.",
  shortDescription: 'Join text elements with a specified separator',
  keywords: ['join'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:join.title',
    description: 'string:join.description',
    shortDescription: 'string:join.shortDescription'
  }
});
