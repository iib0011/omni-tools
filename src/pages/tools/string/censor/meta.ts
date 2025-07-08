import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  name: 'Text Censor',
  path: 'censor',
  shortDescription:
    'Quickly mask bad words or replace them with alternative words.',
  icon: 'hugeicons:text-footnote',
  description:
    "utility for censoring words in text. Load your text in the input form on the left, specify all the bad words in the options, and you'll instantly get censored text in the output area.",
  longDescription:
    'With this online tool, you can censor certain words in any text. You can specify a list of unwanted words (such as swear words or secret words) and the program will replace them with alternative words and create a safe-to-read text. The words can be specified in a multi-line text field in the options by entering one word per line.',
  keywords: ['text', 'censor', 'words', 'characters'],
  component: lazy(() => import('./index'))
});
