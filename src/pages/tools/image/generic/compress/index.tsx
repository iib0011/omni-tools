import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InitialValuesType } from './types';
import { compressImages } from './service';
import ToolContent from '@components/ToolContent';
import ToolMultipleImageInput, {
  MultiImageInput
} from '@components/input/ToolMultipleImageInput';
import { ToolComponentProps } from '@tools/defineTool';
import ToolMultiFileResult from '@components/result/ToolMultiFileResult';
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
  const [input, setInput] = useState<MultiImageInput[]>([]);
  const [results, setResults] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null); // Store original file size
  const [compressedSize, setCompressedSize] = useState<number | null>(null); // Store compressed file size
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const compute = async (
    values: InitialValuesType,
    input: MultiImageInput[]
  ) => {
    if (!input.length) return;

    setOriginalSize(input.reduce((acc, img) => acc + img.file.size, 0));

    try {
      setIsProcessing(true);

      const output = await compressImages(
        input.map((img) => img.file),
        values
      );

      if (!output) {
        showSnackBar(t('compress.failedToCompress'), 'error');
        return;
      }

      if (output.results.length < input.length) {
        showSnackBar(t('compress.failedToCompress'), 'error');
      }

      setResults(output.results);
      setZipFile(output.zipFile);
      setCompressedSize(output.results.reduce((acc, f) => acc + f.size, 0));
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
        <ToolMultipleImageInput
          value={input}
          type={'image'}
          onChange={setInput}
          accept={['image/*']}
          title={t('compress.inputTitle')}
        />
      }
      resultComponent={
        <ToolMultiFileResult
          title={t('compress.resultTitle')}
          value={results}
          zipFile={zipFile}
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
