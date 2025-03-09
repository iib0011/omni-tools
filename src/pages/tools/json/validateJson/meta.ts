import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Validate JSON',
  path: 'validateJson',
  icon: 'lets-icons:json-light',
  description:
    'Validate JSON data and identify formatting issues such as missing quotes, trailing commas, and incorrect brackets.',
  shortDescription: 'Quickly validate a JSON data structure.',
  keywords: ['validate', 'json', 'syntax'],
  component: lazy(() => import('./index'))
});
