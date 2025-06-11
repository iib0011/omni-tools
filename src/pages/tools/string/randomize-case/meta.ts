import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: i18n.t('randomizeCase'),
  path: 'randomize-case',
  icon: 'material-symbols-light:format-textdirection-l-to-r',
  description: i18n.t('randomizeCaseDescription'),
  shortDescription: i18n.t('randomizeCaseShortDescription'),
  keywords: ['randomize', 'case'],
  component: lazy(() => import('./index'))
});
