import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:qrCode.title',
    description: 'image:qrCode.description',
    shortDescription: 'image:qrCode.shortDescription'
  },

  path: 'qr-code',
  icon: 'mdi:qrcode', // Iconify icon as a string
  keywords: [
    'qr code',
    'qrcode',
    'generator',
    'url',
    'text',
    'email',
    'phone',
    'sms',
    'wifi',
    'vcard',
    'contact'
  ],
  component: lazy(() => import('./index'))
});
