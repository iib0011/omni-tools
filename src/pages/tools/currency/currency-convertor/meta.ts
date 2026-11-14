import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('currency', {
  i18n: {
    name: 'translation:currencyConvertor.title',
    description: 'translation:currencyConvertor.description',
    shortDescription: 'translation:currencyConvertor.shortDescription',
    longDescription: 'translation:currencyConvertor.longDescription'
  },
  path: 'currency-convertor',
  icon: 'material-symbols:currency-exchange',
  keywords: ['currency', 'convertor'],
  component: lazy(() => import('./index'))
});
