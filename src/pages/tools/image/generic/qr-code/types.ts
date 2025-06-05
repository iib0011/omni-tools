export type QRCodeType =
  | 'URL'
  | 'Text'
  | 'Email'
  | 'Phone'
  | 'SMS'
  | 'WiFi'
  | 'vCard';

export type WifiEncryptionType = 'WPA/WPA2' | 'WEP' | 'None';

export interface InitialValuesType {
  qrCodeType: QRCodeType;

  // Common settings
  size: string;
  bgColor: string;
  fgColor: string;

  // URL
  url: string;

  // Text
  text: string;

  // Email
  emailAddress: string;
  emailSubject: string;
  emailBody: string;

  // Phone
  phoneNumber: string;

  // SMS
  smsNumber: string;
  smsMessage: string;

  // WiFi
  wifiSsid: string;
  wifiPassword: string;
  wifiEncryption: WifiEncryptionType;

  // vCard
  vCardName: string;
  vCardEmail: string;
  vCardPhone: string;
  vCardAddress: string;
  vCardCompany: string;
  vCardTitle: string;
  vCardWebsite: string;
}
