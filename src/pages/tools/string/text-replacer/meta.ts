import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  i18n: {
    name: 'string:textReplacer.title',
    description: 'string:textReplacer.description',
    shortDescription: 'string:textReplacer.shortDescription'
  },
  name: 'Text Replacer',
  path: 'replacer',
  shortDescription: 'Quickly replace text in your content',
  icon: 'material-symbols-light:find-replace',
  description:
    'Easily replace specific text in your content with this simple, browser-based tool. Just input your text, set the text you want to replace and the replacement value, and instantly get the updated version.',
  keywords: ['text', 'replace'],
  component: lazy(() => import('./index'))
});
