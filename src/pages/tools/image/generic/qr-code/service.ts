import * as QRCode from 'qrcode';
import { InitialValuesType } from './types';

/** Formats the raw form values into the string that gets encoded in the QR code, based on the selected type. */
export function formatQRCodeData(values: InitialValuesType): string {
  switch (values.qrCodeType) {
    case 'URL':
      return values.url;

    case 'Text':
      return values.text;

    case 'Email': {
      let emailData = `mailto:${values.emailAddress}`;
      if (values.emailSubject || values.emailBody) {
        emailData += '?';
        if (values.emailSubject) {
          emailData += `subject=${encodeURIComponent(values.emailSubject)}`;
        }
        if (values.emailBody) {
          emailData += `${
            values.emailSubject ? '&' : ''
          }body=${encodeURIComponent(values.emailBody)}`;
        }
      }
      return emailData;
    }
    case 'Phone':
      return `tel:${values.phoneNumber}`;

    case 'SMS':
      return `sms:${values.smsNumber}${
        values.smsMessage
          ? `?body=${encodeURIComponent(values.smsMessage)}`
          : ''
      }`;

    case 'WiFi': {
      const encryption =
        values.wifiEncryption === 'None' ? 'nopass' : values.wifiEncryption;
      return `WIFI:T:${encryption};S:${values.wifiSsid};P:${values.wifiPassword};;`;
    }
    case 'vCard':
      return `BEGIN:VCARD
VERSION:3.0
N:${values.vCardName}
FN:${values.vCardName}
ORG:${values.vCardCompany}
TITLE:${values.vCardTitle}
TEL:${values.vCardPhone}
EMAIL:${values.vCardEmail}
ADR:${values.vCardAddress}
URL:${values.vCardWebsite}
END:VCARD`;

    default:
      return '';
  }
}

/**
 * Renders the QR code for the given form values and returns it as a
 * downloadable PNG File. Returns null if there's nothing to encode yet
 * (e.g. required field for the current type is still empty).
 */
export function generateQrCodeFile(
  options: InitialValuesType
): Promise<File | null> {
  const qrValue = formatQRCodeData(options);
  if (!qrValue) return Promise.resolve(null);

  const canvas = document.createElement('canvas');

  return new Promise((resolve, reject) => {
    QRCode.toDataURL(
      canvas,
      qrValue,
      {
        color: {
          dark: options.fgColor,
          light: options.bgColor
        },
        width: Number(options.size) || 200,
        errorCorrectionLevel: options.correctionLevel
      },
      async (error, url) => {
        // The original callback never checked `error`, so a QR generation
        // failure (e.g. text too long for the chosen correction level)
        // would silently try to fetch `undefined` and throw a confusing
        // error instead. Surface it properly here.
        if (error) {
          reject(error);
          return;
        }
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          const file = new File([blob], 'qr-code.png', { type: 'image/png' });
          resolve(file);
        } catch (fetchErr) {
          reject(fetchErr);
        }
      }
    );
  });
}
