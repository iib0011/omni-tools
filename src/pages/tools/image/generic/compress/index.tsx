import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InitialValuesType } from './types';
import { compressImage } from './service';
import ToolContent from '@components/ToolContent';
import ToolImageInput from '@components/input/ToolImageInput';
import { ToolComponentProps } from '@tools/defineTool';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { CustomSnackBarContext } from '../../../../../contexts/CustomSnackBarContext';
import { updateNumberField } from '@utils/string';

const initialValues: InitialValuesType = {
  maxFileSizeInMB: 1.0,
  quality: 80
};

export default function CompressImage({ title }: ToolComponentProps) {
  const { t } = useTranslation('image');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null); // Store original file size
  const [compressedSize, setCompressedSize] = useState<number | null>(null); // Store compressed file size
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) return;

    setOriginalSize(input.size);
    try {
      setIsProcessing(true);

      const compressed = await compressImage(input, values);

      if (compressed) {
        setResult(compressed);
        setCompressedSize(compressed.size);
      } else {
        showSnackBar(t('compress.failedToCompress'), 'error');
      }
    } catch (err) {
      console.error('Error in compression:', err);
    } finally {
      setIsProcessing(false);
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
          accept={['image/*']}
          title={t('compress.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('compress.resultTitle')}
          value={result}
          loading={isProcessing}
        />
      }
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: t('compress.compressionOptions'),
          component: (
            <Box>
              <TextFieldWithDesc
                name="maxFileSizeInMB"
                type="number"
                inputProps={{ min: 0.1, step: 0.1 }}
                description={t('compress.maxFileSizeDescription')}
                onOwnChange={(value) =>
                  updateNumberField(value, 'maxFileSizeInMB', updateField)
                }
                value={values.maxFileSizeInMB}
              />
              <TextFieldWithDesc
                name="quality"
                type="number"
                inputProps={{ min: 10, max: 100, step: 1 }}
                description={t('compress.qualityDescription')}
                onOwnChange={(value) =>
                  updateNumberField(value, 'quality', updateField)
                }
                value={values.quality}
              />
            </Box>
          )
        },
        {
          title: t('compress.fileSizes'),
          component: (
            <Box>
              <Box>
                {originalSize !== null && (
                  <Typography>
                    {t('compress.originalSize')}:{' '}
                    {(originalSize / 1024).toFixed(2)} KB
                  </Typography>
                )}
                {compressedSize !== null && (
                  <Typography>
                    {t('compress.compressedSize')}:{' '}
                    {(compressedSize / 1024).toFixed(2)} KB
                  </Typography>
                )}
              </Box>
            </Box>
          )
        }
      ]}
      compute={compute}
      setInput={setInput}
    />
  );
}
