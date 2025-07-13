import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Create palindrome',
  path: 'create-palindrome',
  icon: 'material-symbols-light:repeat',
  description:
    "World's simplest browser-based utility for creating palindromes from any text. Input text and instantly transform it into a palindrome that reads the same forward and backward. Perfect for word games, creating symmetrical text patterns, or exploring linguistic curiosities.",
  shortDescription: 'Create text that reads the same forward and backward',
  longDescription:
    'This tool creates a palindrome from the given string. It does it by generating a copy of the string, reversing it, and appending it at the end of the original string. This method creates a palindrome with the last character duplicated twice. There is also another way to do it, which deletes the first letter of the reversed copy. In this case, when the string and the copy are joined together, you also get a palindrome but without the repeating last character. You can compare the two types of palindromes by switching between them in the options. You can also enable the multi-line mode that will create palindromes of every string on every line. Stringabulous!',
  keywords: ['create', 'palindrome'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:createPalindrome.title',
    description: 'string:createPalindrome.description',
    shortDescription: 'string:createPalindrome.shortDescription'
  }
});
