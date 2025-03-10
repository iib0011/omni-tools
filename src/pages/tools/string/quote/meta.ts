import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Quote',
  path: 'quote',
  icon: 'proicons:quote',
  description:
    'A tool to add quotation marks or custom characters around text. Perfect for formatting strings for code, citations, or stylistic purposes.',
  shortDescription: 'Add quotes around text easily.',
  keywords: ['quote'],
  component: lazy(() => import('./index'))
});
