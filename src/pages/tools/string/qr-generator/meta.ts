import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
//import { QrCodeIcon } from '@iconify-icons/mdi/qrcode';

export const tool = defineTool('string', {
  path: 'qr-generator',
  name: 'QR 코드 생성기',
  icon: 'proicons:quote',
  description: '텍스트를 QR 코드로 변환합니다.',
  shortDescription: 'QR 코드 생성',
  longDescription: '입력한 문자열을 QR 코드로 생성하는 도구입니다.',
  keywords: ['qr', 'code', 'generator', 'string', '텍스트'],
  component: lazy(() => import('./index'))
});
