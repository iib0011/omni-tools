import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('png', {
  name: 'Remove Background from PNG',
  path: 'remove-background',
  icon: 'mdi:image-remove',
  description:
    "World's simplest online tool to remove backgrounds from PNG images. Just upload your image and our AI-powered tool will automatically remove the background, giving you a transparent PNG. Perfect for product photos, profile pictures, and design assets.",
  shortDescription: 'Automatically remove backgrounds from images',
  keywords: ['remove', 'background', 'png', 'transparent', 'image', 'ai'],
  component: lazy(() => import('./index'))
});
