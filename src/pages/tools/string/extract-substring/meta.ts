import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  path: 'extract-substring',
  icon: 'material-symbols-light:content-cut',

  keywords: ['extract', 'substring'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:extractSubstring.title',
    description: 'string:extractSubstring.description',
    shortDescription: 'string:extractSubstring.shortDescription',
    userTypes: ['General Users', 'Developers']
  }
});
