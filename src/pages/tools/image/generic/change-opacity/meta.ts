import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('image-generic', {
  name: i18n.t('changeImageOpacity'),
  path: 'change-opacity',
  icon: 'material-symbols:opacity',
  description: i18n.t('changeImageOpacityDescription'),
  shortDescription: i18n.t('changeImageOpacityShortDescription'),
  keywords: ['opacity', 'transparency', 'png', 'alpha', 'jpg', 'jpeg', 'image'],
  component: lazy(() => import('./index'))
});
