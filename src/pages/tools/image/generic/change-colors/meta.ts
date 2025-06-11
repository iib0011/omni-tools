import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('image-generic', {
  name: i18n.t('changeColorsInImage'),
  path: 'change-colors',
  icon: 'cil:color-fill',
  description: i18n.t('changeColorsInImageDescription'),
  shortDescription: i18n.t('changeColorsInImageShortDescription'),
  keywords: ['change', 'colors', 'in', 'png', 'image', 'jpg'],
  component: lazy(() => import('./index'))
});
