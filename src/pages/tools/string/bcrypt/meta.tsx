import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  path: 'bcrypt',
  icon: 'arcticons:encrypt-text',

  keywords: ['bcrypt', 'hash', 'cryptography', 'password', 'security'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:bcrypt.title',
    description: 'string:bcrypt.description',
    shortDescription: 'string:bcrypt.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
