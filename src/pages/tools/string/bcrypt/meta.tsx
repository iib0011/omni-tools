import { defineTool } from '../../../../tools/defineTool';
import { lazy } from 'react';

const Component = lazy(() => import('./Component'));

export const tool = defineTool('string', {
  path: 'bcrypt',
  name: 'BCrypt Hash',
  description: 'Generate BCrypt hashes from text with customizable salt rounds',
  shortDescription: 'Generate secure BCrypt hashes',
  keywords: [
    'bcrypt',
    'hash',
    'password',
    'security',
    'encryption',
    'cryptography'
  ],
  icon: 'mdi:lock',
  component: Component
});
