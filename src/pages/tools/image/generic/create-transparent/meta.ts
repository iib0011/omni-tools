import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('image-generic', {
  name: i18n.t('createTransparentPng'),
  path: 'create-transparent',
  icon: 'mdi:circle-transparent',
  shortDescription: i18n.t('createTransparentPngShortDescription'),
  description: i18n.t('createTransparentPngDescription'),
  keywords: ['create', 'transparent'],
  component: lazy(() => import('./index'))
});
