import { Box } from '@mui/material';
import React, { useState } from 'react';
import * as Yup from 'yup';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from 'components/options/TextFieldWithDesc';
import imageCompression from 'browser-image-compression';
import Typography from '@mui/material/Typography';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';

const initialValues = {
  rate: '50'
};
const validationSchema = Yup.object({
  // splitSeparator: Yup.string().required('The separator is required')
});

export default function ChangeColorsInPng({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null); // Store original file size
  const [compressedSize, setCompressedSize] = useState<number | null>(null); // Store compressed file size

  const compressImage = async (file: File, rate: number) => {
    if (!file) return;

    // Set original file size
    setOriginalSize(file.size);

    const options = {
      maxSizeMB: 1, // Maximum size in MB
      maxWidthOrHeight: 1024, // Maximum width or height
      quality: rate / 100, // Convert percentage to decimal (e.g., 50% becomes 0.5)
      useWebWorker: true
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setResult(compressedFile);
      setCompressedSize(compressedFile.size); // Set compressed file size
    } catch (error) {
      console.error('Error during compression:', error);
    }
  };

  const compute = (optionsValues: typeof initialValues, input: any) => {
    if (!input) return;

    const { rate } = optionsValues;
    compressImage(input, Number(rate)); // Pass the rate as a number
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
          title={'Input PNG'}
        />
      }
      resultComponent={
        <ToolFileResult
          title={'Compressed PNG'}
          value={result}
          extension={'png'}
        />
      }
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: 'Compression options',
          component: (
            <Box>
              <TextFieldWithDesc
                value={values.rate}
                onOwnChange={(val) => updateField('rate', val)}
                description={'Compression rate (1-100)'}
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
