import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('video', {
  name: i18n.t('loopVideo'),
  path: 'loop',
  icon: 'ic:baseline-loop',
  description: i18n.t('loopVideoDescription'),
  shortDescription: i18n.t('loopVideoShortDescription'),
  keywords: ['loop', 'video', 'repeat', 'duplicate', 'sequence', 'playback'],
  component: lazy(() => import('./index'))
});
