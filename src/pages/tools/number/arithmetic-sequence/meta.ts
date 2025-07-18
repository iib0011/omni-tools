import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('number', {
  path: 'arithmetic-sequence',
  icon: 'material-symbols:functions',

  keywords: ['arithmetic', 'sequence', 'math', 'progression'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'number:arithmeticSequence.title',
    description: 'number:arithmeticSequence.description',
    shortDescription: 'number:arithmeticSequence.shortDescription',
    userTypes: ['Students']
  }
});
