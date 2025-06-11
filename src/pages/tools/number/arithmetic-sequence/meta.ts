import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('number', {
  name: i18n.t('generateArithmeticSequence'),
  path: 'arithmetic-sequence',
  icon: 'ic:sharp-plus',
  description: i18n.t('generateArithmeticSequenceDescription'),
  shortDescription: i18n.t('generateArithmeticSequenceShortDescription'),
  longDescription: i18n.t('generateArithmeticSequenceLongDescription'),
  keywords: [
    'arithmetic',
    'sequence',
    'progression',
    'numbers',
    'series',
    'generate'
  ],
  component: lazy(() => import('./index'))
});
