import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  name: 'Uppercase',
  path: 'uppercase',
  icon: 'material-symbols-light:format-textdirection-l-to-r',
  description:
    "World's simplest browser-based utility for converting text to uppercase. Input your text and instantly get all characters in uppercase. Perfect for formatting, shouting, or emphasizing text.",
  shortDescription: 'Convert text to uppercase',
  keywords: ['uppercase'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:uppercase.title',
    description: 'string:uppercase.description',
    shortDescription: 'string:uppercase.shortDescription'
  }
});
