import { Box, Slider, Typography } from '@mui/material';
import ToolImageInput from 'components/input/ToolImageInput';
import ColorSelector from 'components/options/ColorSelector';
import ToolFileResult from 'components/result/ToolFileResult';
import Color from 'color';
import React, { useState } from 'react';
import * as Yup from 'yup';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import heic2any from 'heic2any';

const initialValues = {
  quality: 85,
  backgroundColor: '#ffffff'
};

const validationSchema = Yup.object({
  quality: Yup.number().min(1).max(100).required('Quality is required'),
  backgroundColor: Yup.string().required('Background color is required')
});

function isHeicLike(file: File) {
  if (['heic', 'heif'].includes(file.type)) return true;

  const name = file.name.toLowerCase();
  return name.endsWith('.heic') || name.endsWith('.heif');
}

export default function ConvertToJpg({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const compute = async (
    optionsValues: typeof initialValues,
    input: any
  ): Promise<void> => {
    if (!input) return;

    const processImage = async (
      file: File,
      quality: number,
      backgroundColor: string
    ) => {
      try {
        let workingBlob: Blob = file;
        let workingName = file.name;

        if (isHeicLike(file)) {
          try {
            const converted = await heic2any({
              blob: file,
              toType: 'image/png',
              quality: 1
            });
            const blobOut = Array.isArray(converted) ? converted[0] : converted;

            workingBlob = blobOut as Blob;
            workingName = file.name.replace(/\.[^/.]+$/, '') + '.png';
            const pngFile = new File([workingBlob], workingName, {
              type: 'image/png'
            });
            setInput(pngFile);
          } catch (e) {
            console.error('heic2any conversion failed:', e);
            throw e;
          }
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const objectUrl = URL.createObjectURL(workingBlob);
        const img = new Image();
        img.src = objectUrl;

        await img.decode();

        canvas.width = img.width;
        canvas.height = img.height;

        // Fill background with selected color (important for transparency)
        let bgColor: [number, number, number];
        try {
          //@ts-ignore
          bgColor = Color(backgroundColor).rgb().array();
        } catch {
          bgColor = [255, 255, 255]; // Default to white
        }
        ctx.fillStyle = `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        URL.revokeObjectURL(objectUrl);

        await new Promise<void>((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const baseName = workingName.replace(/\.[^/.]+$/, '');
                const outName = baseName + '.jpg';
                const newFile = new File([blob], outName, {
                  type: 'image/jpeg'
                });
                setResult(newFile);
              }
              resolve();
            },
            'image/jpeg',
            quality / 100
          );
        });
      } catch (error) {
        console.error('Error processing image:', error);
      }
    };

    processImage(input, optionsValues.quality, optionsValues.backgroundColor);
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={[
            'image/png',
            'image/gif',
            'image/tiff',
            'image/tif',
            'image/webp',
            'image/svg+xml',
            'image/heic',
            'image/heif',
            'image/raw',
            'image/x-adobe-dng',
            'image/x-canon-cr2',
            'image/x-canon-crw',
            'image/x-nikon-nef',
            'image/x-sony-arw',
            'image/vnd.adobe.photoshop'
          ]}
          title={'Input Image'}
        />
      }
      resultComponent={
        <ToolFileResult title={'Output JPG'} value={result} extension={'jpg'} />
      }
      initialValues={initialValues}
      validationSchema={validationSchema}
      getGroups={({ values, updateField }) => [
        {
          title: 'JPG Quality Settings',
          component: (
            <Box>
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  JPG Quality: {values.quality}%
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
