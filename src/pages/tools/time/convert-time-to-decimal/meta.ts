import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  i18n: {
    name: 'time:convertTimeToDecimal.title',
    description: 'time:convertTimeToDecimal.description',
    shortDescription: 'time:convertTimeToDecimal.shortDescription',
    longDescription: 'time:convertTimeToDecimal.longDescription'
  },
  path: 'convert-time-to-decimal',
  icon: 'material-symbols-light:decimal-increase-rounded',
  keywords: ['convert', 'time', 'to', 'decimal'],
  component: lazy(() => import('./index'))
});
