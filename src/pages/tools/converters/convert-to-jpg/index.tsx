import { Box, Slider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ToolMultipleImageInput, {
  MultiImageInput
} from '@components/input/ToolMultipleImageInput';
import ColorSelector from 'components/options/ColorSelector';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolMultiFileResult from '@components/result/ToolMultiFileResult';
import React, { useState, useContext, useCallback } from 'react';
import * as Yup from 'yup';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import InitialValuesType from './types';
import { convertToJPG } from './service';
import { CustomSnackBarContext } from 'contexts/CustomSnackBarContext';
import debounce from 'lodash/debounce';

const initialValues: InitialValuesType = {
  quality: 85,
  backgroundColor: '#ffffff'
};

const validationSchema = Yup.object({
  quality: Yup.number().min(1).max(100).required('Quality is required'),
  backgroundColor: Yup.string().required('Background color is required')
});

export default function ConvertToJpg({ title }: ToolComponentProps) {
  const { t } = useTranslation('converters');
  const [input, setInput] = useState<MultiImageInput[]>([]);
  const [results, setResults] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const compute = async (
    optionsValues: InitialValuesType,
    input: MultiImageInput[]
  ) => {
    if (!input.length) return;

    try {
      setIsProcessing(true);

      const output = await convertToJPG(
        input.map((img) => img.file),
        optionsValues
      );

      if (!output) {
        showSnackBar(t('convertToJPG.failedToConvert'), 'error');
        return;
      }

      if (output.results.length < input.length) {
        showSnackBar(t('convertToJPG.failedToConvert'), 'error');
      }

      setResults(output.results);
      setZipFile(output.zipFile);
    } catch (err) {
      console.error('Error in conversion:', err);
    } finally {
      setIsProcessing(false);
    }
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
          title={t('convertToJPG.inputTitle')}
        />
      }
      resultComponent={
        zipFile ? (
          <ToolMultiFileResult
            title={t('convertToJPG.resultTitle')}
            value={results}
            zipFile={zipFile}
            loading={isProcessing}
          />
        ) : (
          <ToolFileResult
            title={t('convertToJPG.resultTitle')}
            value={results[0] ?? null}
            extension={results[0]?.name.split('.').pop() || 'jpg'}
          />
        )
      }
      initialValues={initialValues}
      validationSchema={validationSchema}
      getGroups={({ values, updateField }) => [
        {
          title: t('convertToJPG.options.title'),
          component: (
            <Box>
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('convertToJPG.options.quality')} {values.quality}%
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
                  {t('convertToJPG.options.qualityDescription')}
                </Typography>
              </Box>

              <ColorSelector
                value={values.backgroundColor}
                onColorChange={(val) => updateField('backgroundColor', val)}
                description={t('convertToJPG.options.colorDescription')}
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
