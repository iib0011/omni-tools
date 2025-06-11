import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('image-generic', {
  name: i18n.t('qrCodeGenerator'),
  path: 'qr-code',
  icon: 'mdi:qrcode', // Iconify icon as a string
  description: i18n.t('qrCodeGeneratorDescription'),
  shortDescription: i18n.t('qrCodeGeneratorShortDescription'),
  longDescription: i18n.t('qrCodeGeneratorLongDescription'),
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
