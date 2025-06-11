import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';
// import image from '@assets/text.png';

export const tool = defineTool('number', {
  name: i18n.t('numberSumCalculator'),
  path: 'sum',
  icon: 'fluent:autosum-20-regular',
  description: i18n.t('numberSumCalculatorDescription'),
  shortDescription: i18n.t('numberSumCalculatorShortDescription'),
  longDescription: i18n.t('numberSumCalculatorLongDescription'),
  keywords: ['sum'],
  component: lazy(() => import('./index'))
});
