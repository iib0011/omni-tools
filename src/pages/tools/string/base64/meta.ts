import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  name: 'Base64',
  path: 'base64',
  icon: 'tabler:number-64-small',
  description:
    'A simple tool to encode or decode data using Base64, which is commonly used in web applications.',
  shortDescription: 'Encode or decode data using Base64.',
  keywords: ['base64'],
  userTypes: ['Developers', 'CyberSec'],
  component: lazy(() => import('./index'))
});
