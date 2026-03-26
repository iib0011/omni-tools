import { Box, Slider, Typography } from '@mui/material';
import ToolImageInput from 'components/input/ToolImageInput';
import ColorSelector from 'components/options/ColorSelector';
import ToolFileResult from 'components/result/ToolFileResult';
import Color from 'color';
import React, { useState } from 'react';
import * as Yup from 'yup';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';

const initialValues = {
  backgroundColor: '#ffffff',
  // Initial Max Size is 50MB
  maxSize: 50
};

const validationSchema = Yup.object({
  quality: Yup.number().min(1).max(100).required('Quality is required'),
  backgroundColor: Yup.string().required('Background color is required'),
  maxSize: Yup.number()
    .min(1)
    .max(100)
    .required('Maximum file size is required')
});

export default function ConvertToJpg({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const compute = async (
    optionsValues: typeof initialValues,
    input: any
  ): Promise<void> => {
    if (!input) return;
    setResult(null);

    const processImage = async (
      file: File,
      maxSize: number,
      backgroundColor: string
    ) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx == null) return;

      const img = new Image();
      img.src = URL.createObjectURL(file);

      try {
        await img.decode();

        canvas.width = img.width;
        canvas.height = img.height;

        // Fill background with selected color (important for transparency)
        let bgColor: [number, number, number];
        try {
          //@ts-ignore
          bgColor = Color(backgroundColor).rgb().array();
        } catch (err) {
          bgColor = [255, 255, 255]; // Default to white
        }

        ctx.fillStyle = `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the image on top
        ctx.drawImage(img, 0, 0);

        // Check If Size is Within Constraint
        const quality = 100;
        const maxByteCount = maxSize * 1024 * 1024;
        const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';

        const convertWithSize = (quality: number): Promise<void> => {
          return new Promise((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const newFile = new File([blob], fileName, {
                    type: 'image/webp'
                  });

                  // Step Down by 10% Quality Every Time
                  if (newFile.size > maxByteCount) {
                    if (quality > 10) {
                      convertWithSize(quality - 10)
                        .then(resolve)
                        .catch(reject);
                    } else {
                      reject(
                        new Error(
                          'Image cannot be converted within given size!'
                        )
                      );
                    }
                  } else {
                    setResult(newFile);
                    resolve();
                  }
                } else {
                  reject(new Error('Canvas toBlob returned as null'));
                }
              },
              'image/webp',
              quality / 100
            );
          });
        };

        await convertWithSize(quality);
      } catch (error) {
        console.error('Error processing image:', error);
      } finally {
        URL.revokeObjectURL(img.src);
      }
    };

    await processImage(
      input,
      optionsValues.maxSize,
      optionsValues.backgroundColor
    );
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/jpeg', 'image/png', 'image/gif', 'image/jpg']}
          title={'Input Image'}
        />
      }
      resultComponent={
        <ToolFileResult
          title={'Output WebP'}
          value={result}
          extension={'webp'}
        />
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
                  WebP File Size: {values.maxSize}MB
                </Typography>
                <Slider
                  value={values.maxSize}
                  onChange={(_, value) =>
                    updateField(
                      'maxSize',
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
