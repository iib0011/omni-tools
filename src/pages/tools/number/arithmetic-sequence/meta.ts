import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('number', {
  name: 'Arithmetic Sequence',
  path: 'arithmetic-sequence',
  icon: 'material-symbols:functions',
  description:
    'Generate arithmetic sequences with specified start value, common difference, and number of terms. Create mathematical progressions for calculations or analysis.',
  shortDescription: 'Generate arithmetic sequences',
  keywords: ['arithmetic', 'sequence', 'math', 'progression'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'number.arithmeticSequence.name',
    description: 'number.arithmeticSequence.description',
    shortDescription: 'number.arithmeticSequence.shortDescription'
  }
});
