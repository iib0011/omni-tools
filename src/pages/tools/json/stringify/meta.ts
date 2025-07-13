import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Stringify JSON',
  path: 'stringify',
  icon: 'material-symbols:code',
  description:
    'Convert JavaScript objects to JSON string format. Serialize data structures into JSON strings for storage or transmission.',
  shortDescription: 'Convert objects to JSON string',
  keywords: ['json', 'stringify', 'serialize', 'convert'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'json:stringify.title',
    description: 'json:stringify.description',
    shortDescription: 'json:stringify.shortDescription'
  }
});
