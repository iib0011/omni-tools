import React, { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import * as Yup from 'yup';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import SelectWithDesc from '@components/options/SelectWithDesc';
import { InitialValuesType, QRCodeType, WifiEncryptionType } from './types';
import ColorSelector from '@components/options/ColorSelector';
import ToolFileResult from '@components/result/ToolFileResult';
import { useTranslation } from 'react-i18next';
import * as QRCode from 'qrcode';
import { debounce } from 'lodash';

const initialValues: InitialValuesType = {
  qrCodeType: 'URL',

  // Common settings
  size: '200',
  bgColor: '#FFFFFF',
  fgColor: '#000000',
  correctionLevel: 'M',

  // URL
  url: 'https://example.com',

  // Text
  text: '',

  // Email
  emailAddress: '',
  emailSubject: '',
  emailBody: '',

  // Phone
  phoneNumber: '',

  // SMS
  smsNumber: '',
  smsMessage: '',

  // WiFi
  wifiSsid: '',
  wifiPassword: '',
  wifiEncryption: 'WPA',

  // vCard
  vCardName: '',
  vCardEmail: '',
  vCardPhone: '',
  vCardAddress: '',
  vCardCompany: '',
  vCardTitle: '',
  vCardWebsite: ''
};

// Function to format the QR code data based on the type
const formatQRCodeData = (values: InitialValuesType): string => {
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
};

const validationSchema = Yup.object().shape({
  qrCodeType: Yup.string().required('QR code type is required'),
  size: Yup.number()
    .min(100, 'Size must be at least 100px')
    .max(1000, 'Size must be at most 1000px')
    .required('Size is required'),
  bgColor: Yup.string().required('Background color is required'),
  fgColor: Yup.string().required('Foreground color is required'),
  correctionLevel: Yup.mixed<'L' | 'M' | 'Q' | 'H'>()
    .oneOf(['L', 'M', 'Q', 'H'])
    .required('Correction level is required'),

  // URL
  url: Yup.string().when('qrCodeType', {
    is: 'URL',
    then: (schema) =>
      schema.url('Please enter a valid URL').required('URL is required')
  }),

  // Text
  text: Yup.string().when('qrCodeType', {
    is: 'Text',
    then: (schema) => schema.required('Text is required')
  }),

  // Email
  emailAddress: Yup.string().when('qrCodeType', {
    is: 'Email',
    then: (schema) =>
      schema
        .email('Please enter a valid email address')
        .required('Email address is required')
  }),

  // Phone
  phoneNumber: Yup.string().when('qrCodeType', {
    is: 'Phone',
    then: (schema) => schema.required('Phone number is required')
  }),

  // SMS
  smsNumber: Yup.string().when('qrCodeType', {
    is: 'SMS',
    then: (schema) => schema.required('Phone number is required')
  }),

  // WiFi
  wifiSsid: Yup.string().when('qrCodeType', {
    is: 'WiFi',
    then: (schema) => schema.required('SSID is required')
  }),

  // vCard
  vCardName: Yup.string().when('qrCodeType', {
    is: 'vCard',
    then: (schema) => schema.required('Name is required')
  })
});

export default function QRCodeGenerator({ title }: ToolComponentProps) {
  const { t } = useTranslation('image');
  const [result, setResult] = useState<File | null>(null);
  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => {
    return [
      {
        title: 'QR Code Type',
        component: (
          <Box>
            <SelectWithDesc
              selected={values.qrCodeType}
              onChange={(value) =>
                updateField('qrCodeType', value as QRCodeType)
              }
              options={[
                { label: 'URL', value: 'URL' },
                { label: 'Text', value: 'Text' },
                { label: 'Email', value: 'Email' },
                { label: 'Phone', value: 'Phone' },
                { label: 'SMS', value: 'SMS' },
                { label: 'WiFi', value: 'WiFi' },
                { label: 'vCard', value: 'vCard' }
              ]}
              description={t('qrCode.options.qrType')}
            />
          </Box>
        )
      },
      {
        title: 'QR Code Settings',
        component: (
          <Box>
            <TextFieldWithDesc
              value={values.size}
              onOwnChange={(val) => updateField('size', val)}
              description={t('qrCode.options.size')}
              inputProps={{
                type: 'number',
                min: 100,
                max: 1000
              }}
            />
            <TextField
              select
              fullWidth
              label="Error Correction Level"
              margin="normal"
              value={values.correctionLevel}
              onChange={(e) =>
                updateField(
                  'correctionLevel',
                  e.target.value as 'L' | 'M' | 'Q' | 'H'
                )
              }
              helperText="Higher levels survive more damage but encode less data"
            >
              <MenuItem value="L">L (~7%)</MenuItem>
              <MenuItem value="M">M (~15%)</MenuItem>
              <MenuItem value="Q">Q (~25%)</MenuItem>
              <MenuItem value="H">H (~30%)</MenuItem>
            </TextField>
            <ColorSelector
              description="Background Color"
              value={values.bgColor}
              onColorChange={(val) => updateField('bgColor', val)}
            />
            <ColorSelector
              description="Foreground Color"
              value={values.fgColor}
              onColorChange={(val) => updateField('fgColor', val)}
            />
          </Box>
        )
      },
      // Dynamic form fields based on QR code type
      {
        title: `${values.qrCodeType} Details`,
        component: (
          <Box>
            {values.qrCodeType === 'URL' && (
              <TextFieldWithDesc
                value={values.url}
                onOwnChange={(val) => updateField('url', val)}
                description={t('qrCode.options.url')}
                inputProps={{
                  placeholder: 'https://example.com'
                }}
              />
            )}

            {values.qrCodeType === 'Text' && (
              <TextFieldWithDesc
                value={values.text}
                onOwnChange={(val) => updateField('text', val)}
                description={t('qrCode.options.text')}
                multiline
                rows={4}
                inputProps={{
                  placeholder: 'Lorem Ipsum'
                }}
              />
            )}

            {values.qrCodeType === 'Email' && (
              <>
                <TextFieldWithDesc
                  value={values.emailAddress}
                  onOwnChange={(val) => updateField('emailAddress', val)}
                  description={t('qrCode.options.email')}
                  inputProps={{
                    placeholder: 'example@example.com',
                    type: 'email'
                  }}
                />
                <TextFieldWithDesc
                  value={values.emailSubject}
                  onOwnChange={(val) => updateField('emailSubject', val)}
                  description={t('qrCode.options.emailSubject')}
                  inputProps={{
                    placeholder: 'Subject line'
                  }}
                />
                <TextFieldWithDesc
                  value={values.emailBody}
                  onOwnChange={(val) => updateField('emailBody', val)}
                  description={t('qrCode.options.emailBody')}
                  multiline
                  rows={4}
                  inputProps={{
                    placeholder: 'Body text'
                  }}
                />
              </>
            )}

            {values.qrCodeType === 'Phone' && (
              <TextFieldWithDesc
                value={values.phoneNumber}
                onOwnChange={(val) => updateField('phoneNumber', val)}
                description={t('qrCode.options.phone')}
                inputProps={{
                  placeholder: '+1234567890',
                  type: 'tel'
                }}
              />
            )}

            {values.qrCodeType === 'SMS' && (
              <>
                <TextFieldWithDesc
                  value={values.smsNumber}
                  onOwnChange={(val) => updateField('smsNumber', val)}
                  description={t('qrCode.options.phone')}
                  inputProps={{
                    placeholder: '+1234567890',
                    type: 'tel'
                  }}
                />
                <TextFieldWithDesc
                  value={values.smsMessage}
                  onOwnChange={(val) => updateField('smsMessage', val)}
                  description={t('qrCode.options.message')}
                  multiline
                  rows={4}
                  inputProps={{
                    placeholder: 'Lorem Ipsum'
                  }}
                />
              </>
            )}

            {values.qrCodeType === 'WiFi' && (
              <>
                <TextFieldWithDesc
                  value={values.wifiSsid}
                  onOwnChange={(val) => updateField('wifiSsid', val)}
                  description={t('qrCode.options.ssid')}
                  inputProps={{
                    placeholder: 'WIFI name'
                  }}
                />
                <TextFieldWithDesc
                  value={values.wifiPassword}
                  onOwnChange={(val) => updateField('wifiPassword', val)}
                  description={t('qrCode.options.password')}
                  inputProps={{
                    placeholder: '******',
                    type: 'password'
                  }}
                />
                <SelectWithDesc
                  selected={values.wifiEncryption}
                  onChange={(value) =>
                    updateField('wifiEncryption', value as WifiEncryptionType)
                  }
                  options={[
                    { label: 'WPA', value: 'WPA' },
                    { label: 'WEP', value: 'WEP' },
                    { label: 'None', value: 'None' }
                  ]}
                  description={t('qrCode.options.encryptionType')}
                />
              </>
            )}

            {values.qrCodeType === 'vCard' && (
              <>
                <TextFieldWithDesc
                  value={values.vCardName}
                  onOwnChange={(val) => updateField('vCardName', val)}
                  description={t('qrCode.options.fullName')}
                  inputProps={{
                    placeholder: 'John Doe'
                  }}
                />
                <TextFieldWithDesc
                  value={values.vCardEmail}
                  onOwnChange={(val) => updateField('vCardEmail', val)}
                  description={t('qrCode.options.email')}
                  inputProps={{
                    placeholder: 'john@example.com',
                    type: 'email'
                  }}
                />
                <TextFieldWithDesc
                  value={values.vCardPhone}
                  onOwnChange={(val) => updateField('vCardPhone', val)}
                  description={t('qrCode.options.phone')}
                  inputProps={{
                    placeholder: '+1234567890',
                    type: 'tel'
                  }}
                />
                <TextFieldWithDesc
                  value={values.vCardAddress}
                  onOwnChange={(val) => updateField('vCardAddress', val)}
                  description={t('qrCode.options.address')}
                  inputProps={{
                    placeholder: '123 Main St, City, Country'
                  }}
                />
                <TextFieldWithDesc
                  value={values.vCardCompany}
                  onOwnChange={(val) => updateField('vCardCompany', val)}
                  description={t('qrCode.options.company')}
                  inputProps={{
                    placeholder: 'Company name'
                  }}
                />
                <TextFieldWithDesc
                  value={values.vCardTitle}
                  onOwnChange={(val) => updateField('vCardTitle', val)}
                  description={t('qrCode.options.job')}
                  inputProps={{
                    placeholder: 'Software Developer'
                  }}
                />
                <TextFieldWithDesc
                  value={values.vCardWebsite}
                  onOwnChange={(val) => updateField('vCardWebsite', val)}
                  description={t('qrCode.options.website')}
                  inputProps={{
                    placeholder: 'https://example.com'
                  }}
                />
              </>
            )}
          </Box>
        )
      }
    ];
  };

  const compute = async (options: InitialValuesType) => {
    const qrValue = formatQRCodeData(options);
    if (!qrValue) return;
    const canvas = document.createElement('canvas');
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
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], 'Qr code.png', { type: 'image/png' });
        setResult(file);
      }
    );
  };
  const debouncedCompute = useCallback(debounce(compute, 1000), []);

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={getGroups}
      validationSchema={validationSchema}
      compute={debouncedCompute}
      resultComponent={
        <ToolFileResult title={t('qrCode.resultOutput')} value={result} />
      }
      toolInfo={{
        title: t('qrCode.title'),
        description: t('qrCode.description')
      }}
    />
  );
}
