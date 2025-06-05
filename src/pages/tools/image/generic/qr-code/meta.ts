import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  name: 'QR Code Generator',
  path: 'qr-code',
  icon: 'mdi:qrcode', // Iconify icon as a string
  description:
    'Generate QR codes for different data types: URL, Text, Email, Phone, SMS, WiFi, vCard, and more.',
  shortDescription: 'Create customized QR codes for various data formats.',
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
