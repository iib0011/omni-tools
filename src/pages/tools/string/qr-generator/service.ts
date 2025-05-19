import QRCode from 'qrcode';

/**
 * 문자열을 QR 코드 SVG 문자열로 변환
 */
export function generateQRCodeSVG(text: string): string {
  let svg = '';
  QRCode.toString(
    text || 'https://example.com',
    { type: 'svg' },
    (err, out) => {
      if (err) console.error(err);
      else svg = out;
    }
  );
  return svg;
}
