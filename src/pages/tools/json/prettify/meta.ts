import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('json', {
  name: 'Prettify JSON',
  path: 'prettify',
  icon: 'lets-icons:json-light',
  description:
    "Just load your JSON in the input field and it will automatically get prettified. In the tool options, you can choose whether to use spaces or tabs for indentation and if you're using spaces, you can specify the number of spaces to add per indentation level.",
  shortDescription: 'Quickly beautify a JSON data structure.',
  keywords: ['prettify'],
  component: lazy(() => import('./index'))
});
