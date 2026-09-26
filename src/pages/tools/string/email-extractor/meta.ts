import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'email-extractor',
  icon: 'material-symbols-light:alternate-email',
  keywords: ['email', 'extract', 'address', 'mail'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:emailExtractor.title',
    description: 'string:emailExtractor.description',
    shortDescription: 'string:emailExtractor.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
