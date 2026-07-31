import React, { useCallback, useState } from 'react';
import { Box, MenuItem, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { InitialValuesType, QRCodeType, WifiEncryptionType } from './types';
import ColorSelector from '@components/options/ColorSelector';
import ToolFileResult from '@components/result/ToolFileResult';
import { debounce } from 'lodash';
import { generateQrCodeFile } from './service';

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
export default function QRCodeGenerator({ title }: ToolComponentProps) {
  const { t } = useTranslation('image');
  const [result, setResult] = useState<File | null>(null);

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => {
    return [
      {
        title: t('qrCode.groups.type.title'),
        component: (
          <Box>
            <TextField
              select
              fullWidth
              value={values.qrCodeType}
              onChange={(e) =>
                updateField('qrCodeType', e.target.value as QRCodeType)
              }
              label={t('qrCode.groups.type.label')}
              margin="normal"
            >
              <MenuItem value="URL">
                {t('qrCode.groups.type.options.url')}
              </MenuItem>
              <MenuItem value="Text">
                {t('qrCode.groups.type.options.text')}
              </MenuItem>
              <MenuItem value="Email">
                {t('qrCode.groups.type.options.email')}
              </MenuItem>
              <MenuItem value="Phone">
                {t('qrCode.groups.type.options.phone')}
              </MenuItem>
              <MenuItem value="SMS">
                {t('qrCode.groups.type.options.sms')}
              </MenuItem>
              <MenuItem value="WiFi">
                {t('qrCode.groups.type.options.wifi')}
              </MenuItem>
              <MenuItem value="vCard">
                {t('qrCode.groups.type.options.vcard')}
              </MenuItem>
            </TextField>
          </Box>
        )
      },
      {
        title: t('qrCode.groups.settings.title'),
        component: (
          <Box>
            <TextFieldWithDesc
              value={values.size}
              onOwnChange={(val) => updateField('size', val)}
              description={t('qrCode.groups.settings.size.description')}
              inputProps={{
                type: 'number',
                min: 100,
                max: 1000
              }}
            />
            <TextField
              select
              fullWidth
              label={t('qrCode.groups.settings.correctionLevel.label')}
              margin="normal"
              value={values.correctionLevel}
              onChange={(e) =>
                updateField(
                  'correctionLevel',
                  e.target.value as 'L' | 'M' | 'Q' | 'H'
                )
              }
              helperText={t(
                'qrCode.groups.settings.correctionLevel.helperText'
              )}
            >
              <MenuItem value="L">
                {t('qrCode.groups.settings.correctionLevel.options.l')}
              </MenuItem>
              <MenuItem value="M">
                {t('qrCode.groups.settings.correctionLevel.options.m')}
              </MenuItem>
              <MenuItem value="Q">
                {t('qrCode.groups.settings.correctionLevel.options.q')}
              </MenuItem>
              <MenuItem value="H">
                {t('qrCode.groups.settings.correctionLevel.options.h')}
              </MenuItem>
            </TextField>
            <ColorSelector
              description={t('qrCode.groups.settings.bgColor')}
              value={values.bgColor}
              onColorChange={(val) => updateField('bgColor', val)}
            />
            <ColorSelector
              description={t('qrCode.groups.settings.fgColor')}
              value={values.fgColor}
              onColorChange={(val) => updateField('fgColor', val)}
            />
          </Box>
        )
      },
      // Dynamic form fields based on QR code type
      {
        title: t('qrCode.groups.details.title', { type: values.qrCodeType }),
        component: (
          <Box>
            {values.qrCodeType === 'URL' && (
              <TextFieldWithDesc
                value={values.url}
                onOwnChange={(val) => updateField('url', val)}
                description={t('qrCode.groups.details.url.description')}
                inputProps={{
                  placeholder: t('qrCode.groups.details.url.placeholder')
                }}
              />
            )}

            {values.qrCodeType === 'Text' && (
              <TextFieldWithDesc
                value={values.text}
                onOwnChange={(val) => updateField('text', val)}
                description={t('qrCode.groups.details.text.description')}
                multiline
                rows={4}
                inputProps={{
                  placeholder: t('qrCode.groups.details.text.placeholder')
                }}
              />
            )}

            {values.qrCodeType === 'Email' && (
              <>
                <TextFieldWithDesc
                  value={values.emailAddress}
                  onOwnChange={(val) => updateField('emailAddress', val)}
                  description={t(
                    'qrCode.groups.details.email.address.description'
                  )}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.email.address.placeholder'
                    ),
                    type: 'email'
                  }}
                />
                <TextFieldWithDesc
                  value={values.emailSubject}
                  onOwnChange={(val) => updateField('emailSubject', val)}
                  description={t(
                    'qrCode.groups.details.email.subject.description'
                  )}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.email.subject.placeholder'
                    )
                  }}
                />
                <TextFieldWithDesc
                  value={values.emailBody}
                  onOwnChange={(val) => updateField('emailBody', val)}
                  description={t(
                    'qrCode.groups.details.email.body.description'
                  )}
                  multiline
                  rows={4}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.email.body.placeholder'
                    )
                  }}
                />
              </>
            )}

            {values.qrCodeType === 'Phone' && (
              <TextFieldWithDesc
                value={values.phoneNumber}
                onOwnChange={(val) => updateField('phoneNumber', val)}
                description={t('qrCode.groups.details.phone.description')}
                inputProps={{
                  placeholder: t('qrCode.groups.details.phone.placeholder'),
                  type: 'tel'
                }}
              />
            )}

            {values.qrCodeType === 'SMS' && (
              <>
                <TextFieldWithDesc
                  value={values.smsNumber}
                  onOwnChange={(val) => updateField('smsNumber', val)}
                  description={t(
                    'qrCode.groups.details.sms.number.description'
                  )}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.sms.number.placeholder'
                    ),
                    type: 'tel'
                  }}
                />
                <TextFieldWithDesc
                  value={values.smsMessage}
                  onOwnChange={(val) => updateField('smsMessage', val)}
                  description={t(
                    'qrCode.groups.details.sms.message.description'
                  )}
                  multiline
                  rows={4}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.sms.message.placeholder'
                    )
                  }}
                />
              </>
            )}

            {values.qrCodeType === 'WiFi' && (
              <>
                <TextFieldWithDesc
                  value={values.wifiSsid}
                  onOwnChange={(val) => updateField('wifiSsid', val)}
                  description={t('qrCode.groups.details.wifi.ssid.description')}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.wifi.ssid.placeholder'
                    )
                  }}
                />
                <TextFieldWithDesc
                  value={values.wifiPassword}
                  onOwnChange={(val) => updateField('wifiPassword', val)}
                  description={t(
                    'qrCode.groups.details.wifi.password.description'
                  )}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.wifi.password.placeholder'
                    ),
                    type: 'password'
                  }}
                />
                <TextField
                  select
                  fullWidth
                  value={values.wifiEncryption}
                  onChange={(e) =>
                    updateField(
                      'wifiEncryption',
                      e.target.value as WifiEncryptionType
                    )
                  }
                  label={t('qrCode.groups.details.wifi.encryption.label')}
                  margin="normal"
                >
                  <MenuItem value="WPA">
                    {t('qrCode.groups.details.wifi.encryption.options.wpa')}
                  </MenuItem>
                  <MenuItem value="WEP">
                    {t('qrCode.groups.details.wifi.encryption.options.wep')}
                  </MenuItem>
                  <MenuItem value="None">
                    {t('qrCode.groups.details.wifi.encryption.options.none')}
                  </MenuItem>
                </TextField>
              </>
            )}

            {values.qrCodeType === 'vCard' && (
              <>
                <TextFieldWithDesc
                  value={values.vCardName}
                  onOwnChange={(val) => updateField('vCardName', val)}
                  description={t(
                    'qrCode.groups.details.vcard.name.description'
                  )}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.vcard.name.placeholder'
                    )
                  }}
                />
                <TextFieldWithDesc
                  value={values.vCardEmail}
                  onOwnChange={(val) => updateField('vCardEmail', val)}
                  description={t(
                    'qrCode.groups.details.vcard.email.description'
                  )}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.vcard.email.placeholder'
                    ),
                    type: 'email'
                  }}
                />
                <TextFieldWithDesc
                  value={values.vCardPhone}
                  onOwnChange={(val) => updateField('vCardPhone', val)}
                  description={t(
                    'qrCode.groups.details.vcard.phone.description'
                  )}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.vcard.phone.placeholder'
                    ),
                    type: 'tel'
                  }}
                />
                <TextFieldWithDesc
                  value={values.vCardAddress}
                  onOwnChange={(val) => updateField('vCardAddress', val)}
                  description={t(
                    'qrCode.groups.details.vcard.address.description'
                  )}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.vcard.address.placeholder'
                    )
                  }}
                />
                <TextFieldWithDesc
                  value={values.vCardCompany}
                  onOwnChange={(val) => updateField('vCardCompany', val)}
                  description={t(
                    'qrCode.groups.details.vcard.company.description'
                  )}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.vcard.company.placeholder'
                    )
                  }}
                />
                <TextFieldWithDesc
                  value={values.vCardTitle}
                  onOwnChange={(val) => updateField('vCardTitle', val)}
                  description={t(
                    'qrCode.groups.details.vcard.title.description'
                  )}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.vcard.title.placeholder'
                    )
                  }}
                />
                <TextFieldWithDesc
                  value={values.vCardWebsite}
                  onOwnChange={(val) => updateField('vCardWebsite', val)}
                  description={t(
                    'qrCode.groups.details.vcard.website.description'
                  )}
                  inputProps={{
                    placeholder: t(
                      'qrCode.groups.details.vcard.website.placeholder'
                    )
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
    try {
      const file = await generateQrCodeFile(options);
      setResult(file);
    } catch (err) {
      console.error('Failed to generate QR code', err);
      setResult(null);
    }
  };

  const debouncedCompute = useCallback(debounce(compute, 1000), []);

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={debouncedCompute}
      resultComponent={
        <ToolFileResult title={t('qrCode.result.title')} value={result} />
      }
      toolInfo={{
        title: t('qrCode.title'),
        description: t('qrCode.longDescription')
      }}
    />
  );
}
