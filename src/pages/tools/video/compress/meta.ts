import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('video', {
  name: i18n.t('compressVideo'),
  path: 'compress',
  icon: 'icon-park-outline:compression',
  description: i18n.t('compressVideoDescription'),
  shortDescription: i18n.t('compressVideoShortDescription'),
  keywords: [
    'compress',
    'video',
    'resize',
    'scale',
    'resolution',
    'reduce size'
  ],
  component: lazy(() => import('./index'))
});
