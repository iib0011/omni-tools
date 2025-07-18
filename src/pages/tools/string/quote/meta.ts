import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  path: 'quote',
  icon: 'material-symbols-light:format-quote',

  keywords: ['quote'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:quote.title',
    description: 'string:quote.description',
    shortDescription: 'string:quote.shortDescription',
    userTypes: ['General Users', 'Students', 'Developers']
  }
});
