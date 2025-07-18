import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'password-generator',
  icon: 'material-symbols:key',
  keywords: ['password', 'generator', 'random', 'secure'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:passwordGenerator.title',
    description: 'string:passwordGenerator.description',
    shortDescription: 'string:passwordGenerator.shortDescription'
  }
});
