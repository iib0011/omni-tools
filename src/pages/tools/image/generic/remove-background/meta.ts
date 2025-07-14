import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:removeBackground.title',
    description: 'image:removeBackground.description',
    shortDescription: 'image:removeBackground.shortDescription'
  },
  name: 'Remove Background from Image',
  path: 'remove-background',
  icon: 'mdi:image-remove',
  description:
    "World's simplest online tool to remove backgrounds from images. Just upload your image and our AI-powered tool will automatically remove the background, giving you a transparent PNG. Perfect for product photos, profile pictures, and design assets.",
  shortDescription: 'Automatically remove backgrounds from images',
  keywords: [
    'remove',
    'background',
    'png',
    'transparent',
    'image',
    'ai',
    'jpg'
  ],
  component: lazy(() => import('./index'))
});
