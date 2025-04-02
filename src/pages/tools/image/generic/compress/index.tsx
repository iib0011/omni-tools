import React, { useContext, useState } from 'react';
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
        showSnackBar('Failed to compress image. Please try again.', 'error');
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
          title={'Input image'}
        />
      }
      resultComponent={
        <ToolFileResult
          title={'Compressed image'}
          value={result}
          loading={isProcessing}
        />
      }
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: 'Compression options',
          component: (
            <Box>
              <TextFieldWithDesc
                label="Max File Size (MB)"
                name="maxFileSizeInMB"
                type="number"
                inputProps={{ min: 0.1, step: 0.1 }}
                description="Maximum file size in megabytes"
                onOwnChange={(value) =>
                  updateNumberField(value, 'maxFileSizeInMB', updateField)
                }
                value={values.maxFileSizeInMB}
              />
              <TextFieldWithDesc
                label="Quality (%)"
                name="quality"
                type="number"
                inputProps={{ min: 10, max: 100, step: 1 }}
                description="Image quality percentage (lower means smaller file size)"
                onOwnChange={(value) =>
                  updateNumberField(value, 'quality', updateField)
                }
                value={values.quality}
              />
            </Box>
          )
        },
        {
          title: 'File sizes',
          component: (
            <Box>
              <Box>
                {originalSize !== null && (
                  <Typography>
                    Original Size: {(originalSize / 1024).toFixed(2)} KB
                  </Typography>
                )}
                {compressedSize !== null && (
                  <Typography>
                    Compressed Size: {(compressedSize / 1024).toFixed(2)} KB
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
