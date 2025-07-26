import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  i18n: {
    name: 'string:hiddenCharacterDetector.title',
    description: 'string:hiddenCharacterDetector.description',
    shortDescription: 'string:hiddenCharacterDetector.shortDescription',
    longDescription: 'string:hiddenCharacterDetector.longDescription',
    userTypes: ['developers']
  },
  path: 'hidden-character-detector',
  icon: 'material-symbols:visibility-off',
  keywords: [
    'hidden',
    'character',
    'detector',
    'unicode',
    'rtl',
    'override',
    'security',
    'invisible'
  ],
  component: lazy(() => import('./index'))
});
