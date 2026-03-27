import { Box, Alert, Chip } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { convertHeicImage, isHeicFile, formatFileSize } from './service';
import { InitialValuesType, ConversionResult } from './types';
import { useTranslation } from 'react-i18next';
import RadioWithTextField from '@components/options/RadioWithTextField';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';

const initialValues: InitialValuesType = {
  outputFormat: 'jpg',
  quality: 85,
  preserveMetadata: false,
  resizeMode: 'none',
  resizeValue: 1920
};

export default function HeicConverter({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) return;

    if (!isHeicFile(input)) {
      setError(t('image:heicConverter.error.invalidFile'));
      return;
    }

    try {
      setError(null);
      setResult(null);

      const conversionResult = await convertHeicImage(input, values);
      setResult(conversionResult);
    } catch (err) {
      console.error('HEIC conversion failed:', err);
      setError(t('image:heicConverter.error.conversionFailed'));
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('image:heicConverter.options.outputFormat.title'),
      component: (
        <Box>
          <RadioWithTextField
            value={values.outputFormat}
            onTextChange={(value: any) => updateField('outputFormat', value)}
            options={[
              {
                value: 'jpg',
                label: t('image:heicConverter.options.outputFormat.jpg')
              },
              {
                value: 'png',
                label: t('image:heicConverter.options.outputFormat.png')
              },
              {
                value: 'webp',
                label: t('image:heicConverter.options.outputFormat.webp')
              }
            ]}
          />

          {values.outputFormat === 'jpg' && (
            <TextFieldWithDesc
              value={values.quality.toString()}
              onOwnChange={(value) =>
                updateField('quality', parseInt(value) || 85)
              }
              description={t('image:heicConverter.options.quality.description')}
              inputProps={{
                type: 'number',
                min: 1,
                max: 100,
                'data-testid': 'quality-input'
              }}
            />
          )}
        </Box>
      )
    },
    {
      title: t('image:heicConverter.options.resize.title'),
      component: (
        <Box>
          <RadioWithTextField
            value={values.resizeMode}
            onTextChange={(value: any) => updateField('resizeMode', value)}
            options={[
              {
                value: 'none',
                label: t('image:heicConverter.options.resize.none')
              },
              {
                value: 'width',
                label: t('image:heicConverter.options.resize.width')
              },
              {
                value: 'height',
                label: t('image:heicConverter.options.resize.height')
              },
              {
                value: 'both',
                label: t('image:heicConverter.options.resize.both')
              }
            ]}
          />

          {values.resizeMode !== 'none' && (
            <TextFieldWithDesc
              value={values.resizeValue.toString()}
              onOwnChange={(value) =>
                updateField('resizeValue', parseInt(value) || 1920)
              }
              description={t(
                'image:heicConverter.options.resizeValue.description'
              )}
              inputProps={{
                type: 'number',
                min: 1,
                'data-testid': 'resize-value-input'
              }}
            />
          )}
        </Box>
      )
    },
    {
      title: t('image:heicConverter.options.advanced.title'),
      component: (
        <Box>
          <CheckboxWithDesc
            title={t('image:heicConverter.options.preserveMetadata.title')}
            checked={values.preserveMetadata}
            onChange={(value) => updateField('preserveMetadata', value)}
            description={t(
              'image:heicConverter.options.preserveMetadata.description'
            )}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      setInput={setInput}
      initialValues={initialValues}
      compute={compute}
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/heic', 'image/heif']}
          title={t('image:heicConverter.input.title')}
        />
      }
      resultComponent={
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {result && (
            <Box>
              <ToolFileResult
                title={t('image:heicConverter.result.title')}
                value={result.file}
                extension={result.format}
              />

              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`${t(
                    'image:heicConverter.result.originalSize'
                  )}: ${formatFileSize(result.originalSize)}`}
                  variant="outlined"
                  color="primary"
                />
                <Chip
                  label={`${t(
                    'image:heicConverter.result.convertedSize'
                  )}: ${formatFileSize(result.convertedSize)}`}
                  variant="outlined"
                  color="secondary"
                />
                <Chip
                  label={`${t(
                    'image:heicConverter.result.compression'
                  )}: ${Math.round(
                    (1 - result.convertedSize / result.originalSize) * 100
                  )}%`}
                  variant="outlined"
                  color="success"
                />
              </Box>
            </Box>
          )}
        </Box>
      }
      getGroups={getGroups}
      toolInfo={{
        title: t('image:heicConverter.info.title'),
        description:
          longDescription || t('image:heicConverter.info.description')
      }}
    />
  );
}
