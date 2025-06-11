import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('png', {
  name: i18n.t('convertJpgToPng'),
  path: 'convert-jgp-to-png',
  icon: 'ph:file-jpg-thin',
  description: i18n.t('convertJpgToPngDescription'),
  shortDescription: i18n.t('convertJpgToPngShortDescription'),
  keywords: ['convert', 'jgp', 'png'],
  component: lazy(() => import('./index'))
});
