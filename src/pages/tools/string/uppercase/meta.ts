import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  name: 'Uppercase',
  path: 'uppercase',
  icon: 'material-symbols-light:text-fields',
  description:
    "World's simplest browser-based utility for converting text to uppercase. Just input your text and it will be automatically converted to all capital letters. Perfect for creating headlines, emphasizing text, or standardizing text format. Supports various text formats and preserves special characters.",
  shortDescription: 'Convert text to uppercase letters',
  keywords: ['uppercase'],
  userTypes: ['General Users', 'Students'],
  component: lazy(() => import('./index'))
});
