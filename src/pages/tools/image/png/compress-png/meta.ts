import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('png', {
  i18n: {
    name: 'image:compressPng.title',
    description: 'image:compressPng.description',
    shortDescription: 'image:compressPng.shortDescription'
  },
  name: 'Compress png',
  path: 'compress-png',
  icon: 'material-symbols-light:compress',
  description:
    'This is a program that compresses PNG pictures. As soon as you paste your PNG picture in the input area, the program will compress it and show the result in the output area. In the options, you can adjust the compression level, as well as find the old and new picture file sizes.',
  shortDescription: 'Quickly compress a PNG',
  keywords: ['compress', 'png'],
  component: lazy(() => import('./index'))
});
