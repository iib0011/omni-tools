import { Box, Slider, Typography } from '@mui/material';
import ColorSelector from 'components/options/ColorSelector';
import ToolFileResult from 'components/result/ToolFileResult';
import React, { useContext, useState } from 'react';
import * as Yup from 'yup';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import InitialValuesType from './types';
import ToolMultipleImageInput, {
  MultiImageInput
} from '@components/input/ToolMultipleImageInput';
import ToolMultiFileResult from '@components/result/ToolMultiFileResult';
import { CustomSnackBarContext } from '../../../../../contexts/CustomSnackBarContext';
import processImages from './service';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  backgroundColor: '#ffffff',
  // Initial Max Size is 50MB
  maxFileSizeInMb: 50
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
  const { t } = useTranslation('image');
  const [input, setInput] = useState<MultiImageInput[]>([]);
  const [result, setResult] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const compute = async (
    optionsValues: typeof initialValues,
    input: MultiImageInput[]
  ): Promise<void> => {
    if (!input || input.length === 0) return;

    // Running the Service
    try {
      setIsProcessing(true);
      const output = await processImages(
        input,
        optionsValues.maxFileSizeInMb,
        optionsValues.backgroundColor
      );

      if (!output) {
        showSnackBar(t('convertToWebp.failedToConvert'), 'error');
        setZipFile(null);
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
          title={'Input Image'}
        />
      }
      resultComponent={
        zipFile ? (
          <ToolMultiFileResult
            title={'Output WebP'}
            value={result}
            zipFile={zipFile}
            loading={isProcessing}
          />
        ) : (
          <ToolFileResult
            title={'Output WebP'}
            value={result[0] ?? null}
            extension={'webp'}
          />
        )
      }
      initialValues={initialValues}
      validationSchema={validationSchema}
      getGroups={({ values, updateField }) => [
        {
          title: 'WebP Size Settings',
          component: (
            <Box>
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  WebP File Size: {values.maxFileSizeInMb}MB
                </Typography>
                <Slider
                  value={values.maxFileSizeInMb}
                  onChange={(_, value) =>
                    updateField(
                      'maxFileSizeInMb',
                      Array.isArray(value) ? value[0] : value
                    )
                  }
                  min={1}
                  max={100}
                  step={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}MB`}
                  sx={{ mt: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Higher values = better quality, larger file size
                </Typography>
              </Box>

              <ColorSelector
                value={values.backgroundColor}
                onColorChange={(val) => updateField('backgroundColor', val)}
                description={'Background color (for transparent images)'}
                inputProps={{ 'data-testid': 'background-color-input' }}
              />
            </Box>
          )
        }
      ]}
      compute={compute}
      setInput={setInput}
    />
  );
}
