import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Escape JSON',
  path: 'escape-json',
  icon: 'lets-icons:json-light',
  description:
    'Free online JSON escaper. Just load your JSON in the input field and it will automatically get escaped. In the tool options, you can optionally enable wrapping the escaped JSON in double quotes to get an escaped JSON string.',
  shortDescription: 'Quickly escape special JSON characters.',
  longDescription: `This tool converts special characters in JSON files and data structures into their escaped versions. Such special characters are, for example, double quotes, newline characters, backslashes, tabs, and many others. If these characters aren't escaped and appear in a raw JSON string without escaping, they can lead to errors in data parsing. The program turns them into safe versions by adding a backslash (\\) before the character, changing its interpretation. Additionally, you can enable the "Wrap Output in Quotes" checkbox in the options, which adds double quotes around the resulting escaped JSON data. This is useful when the escaped JSON data needs to be used as a string in other data structures or the JavaScript programming language. Json-abulous!`,
  keywords: ['escape', 'json'],
  component: lazy(() => import('./index'))
});
