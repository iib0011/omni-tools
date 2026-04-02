import { Box, Slider, Typography } from '@mui/material';
import ColorSelector from 'components/options/ColorSelector';
import ToolFileResult from 'components/result/ToolFileResult';
import React, { useContext, useState, useCallback } from 'react';
import * as Yup from 'yup';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import InitialValuesType from './types';
import ToolMultipleImageInput, {
  MultiImageInput
} from '@components/input/ToolMultipleImageInput';
import ToolMultiFileResult from '@components/result/ToolMultiFileResult';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import { convertToWebp } from './service';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';

const initialValues: InitialValuesType = {
  backgroundColor: '#ffffff',

  quality: 100
};

const validationSchema = Yup.object({
  quality: Yup.number().min(1).max(100).required('Quality is required'),
  backgroundColor: Yup.string().required('Background color is required'),
  maxFileSizeInMb: Yup.number()
    .min(1)
    .max(100)
    .required('Maximum file size is required')
});

export default function ConvertToWebp({ title }: ToolComponentProps) {
  const { t } = useTranslation('converters');
  const [input, setInput] = useState<MultiImageInput[]>([]);
  const [result, setResult] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const compute = async (
    optionsValues: typeof initialValues,
    input: MultiImageInput[]
  ) => {
    if (!input || input.length === 0) return;

    // Running the Service
    try {
      setIsProcessing(true);

      const output = await convertToWebp(
        input.map((img) => img.file),
        optionsValues.quality,
        optionsValues.backgroundColor
      );

      if (!output) {
        showSnackBar(t('convertToWebp.failedToConvert'), 'error');
        return;
      } else {
        setResult(output.convertedFiles);
        setZipFile(output.zipFile);
      }
    } catch (error) {
      showSnackBar(`Error converting files: ${error}`, 'error');
      setZipFile(null);
    } finally {
      setIsProcessing(false);
    }

    console.log('Images are processed');
  };

  const debouncedCompute = useCallback(debounce(compute, 1000), []);

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
          title={t('convertToWebp.inputTitle')}
        />
      }
      resultComponent={
        zipFile ? (
          <ToolMultiFileResult
            title={t('convertToWebp.resultTitle')}
            value={result}
            zipFile={zipFile}
            loading={isProcessing}
          />
        ) : (
          <ToolFileResult
            title={t('convertToWebp.resultTitle')}
            value={result[0] ?? null}
            extension={'webp'}
            loading={isProcessing}
          />
        )
      }
      initialValues={initialValues}
      validationSchema={validationSchema}
      getGroups={({ values, updateField }) => [
        {
          title: t('convertToWebp.options.title'),
          component: (
            <Box>
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('convertToWebp.options.quality')} {values.quality}%
                </Typography>
                <Slider
                  value={values.quality}
                  onChange={(_, value) =>
                    updateField(
                      'quality',
                      Array.isArray(value) ? value[0] : value
                    )
                  }
                  min={1}
                  max={100}
                  step={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {t('convertToWebp.options.qualityDescription')}
                </Typography>
              </Box>

              <ColorSelector
                value={values.backgroundColor}
                onColorChange={(val) => updateField('backgroundColor', val)}
                description={t('convertToWebp.options.colorDescription')}
                inputProps={{ 'data-testid': 'background-color-input' }}
              />
            </Box>
          )
        }
      ]}
      compute={debouncedCompute}
      setInput={setInput}
    />
  );
}
