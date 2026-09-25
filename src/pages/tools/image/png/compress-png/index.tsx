import React, { useContext, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ToolContent from '@components/ToolContent';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolFileResult from '@components/result/ToolFileResult';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { ToolComponentProps } from '@tools/defineTool';
import { updateNumberField } from '@utils/string';
import { CustomSnackBarContext } from '../../../../../contexts/CustomSnackBarContext';
import { compressPng, CompressPngResult } from './service';
import { InitialValuesType } from './types';

const initialValues: InitialValuesType = {
  quality: 60,
  dithering: false,
  maxOutputSizeInKB: 0
};

export default function CompressPng({ title }: ToolComponentProps) {
  const { t } = useTranslation('image');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<CompressPngResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  // Options change while a compression is running; only the last one counts.
  const latestRun = useRef(0);

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) {
      setResult(null);
      return;
    }

    const run = ++latestRun.current;
    setIsProcessing(true);

    try {
      const compressed = await compressPng(input, values);
      if (run !== latestRun.current) return;

      setResult(compressed);
    } catch (error) {
      if (run !== latestRun.current) return;
      setResult(null);
      showSnackBar(
        error instanceof Error ? error.message : t('compressPng.failed'),
        'error'
      );
    } finally {
      if (run === latestRun.current) setIsProcessing(false);
    }
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/png']}
          title={t('compressPng.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('compressPng.resultTitle')}
          value={result?.file ?? null}
          extension={'png'}
          loading={isProcessing}
          loadingText={t('compressPng.compressing')}
        />
      }
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: t('compressPng.compressionOptions'),
          component: (
            <Box>
              <TextFieldWithDesc
                name="quality"
                type="number"
                inputProps={{ min: 1, max: 100, step: 1 }}
                value={values.quality}
                onOwnChange={(value) =>
                  updateNumberField(value, 'quality', updateField)
                }
                description={t('compressPng.qualityDescription')}
              />
              <TextFieldWithDesc
                name="maxOutputSizeInKB"
                type="number"
                inputProps={{ min: 0, step: 10 }}
                value={values.maxOutputSizeInKB}
                onOwnChange={(value) =>
                  updateNumberField(value, 'maxOutputSizeInKB', updateField)
                }
                description={t('compressPng.maxOutputSizeDescription')}
              />
              <CheckboxWithDesc
                title={t('compressPng.dithering')}
                checked={values.dithering}
                onChange={(value) => updateField('dithering', value)}
                description={t('compressPng.ditheringDescription')}
              />
            </Box>
          )
        },
        {
          title: t('compressPng.fileSizes'),
          component: (
            <Box>
              {result ? (
                <Box>
                  <Typography>
                    {t('compressPng.originalSize')}:{' '}
                    {formatSize(result.originalSize)}
                  </Typography>
                  <Typography>
                    {t('compressPng.compressedSize')}:{' '}
                    {formatSize(result.compressedSize)} (
                    {savings(result.originalSize, result.compressedSize)})
                  </Typography>
                  <Typography>
                    {t('compressPng.dimensions')}: {result.width} ×{' '}
                    {result.height} {t('compressPng.dimensionsUnchanged')}
                  </Typography>
                  <Typography>
                    {t('compressPng.colors')}: {result.colors}
                  </Typography>
                  {result.keptOriginal && (
                    <Typography mt={1} color="warning.main">
                      {t('compressPng.alreadyOptimized')}
                    </Typography>
                  )}
                  {!result.targetReached && (
                    <Typography mt={1} color="warning.main">
                      {t('compressPng.targetNotReached')}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography fontSize={12}>
                  {t('compressPng.noStatsYet')}
                </Typography>
              )}
            </Box>
          )
        }
      ]}
      compute={compute}
      setInput={setInput}
    />
  );
}

function formatSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function savings(originalSize: number, compressedSize: number): string {
  if (!originalSize) return '0%';
  const saved = ((originalSize - compressedSize) / originalSize) * 100;
  return `${saved >= 0 ? '-' : '+'}${Math.abs(saved).toFixed(1)}%`;
}
