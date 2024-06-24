import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import Grid from '@mui/material/Grid';
import ToolTextInput from '../../../../components/input/ToolTextInput';
import ToolTextResult from '../../../../components/result/ToolTextResult';
import ToolFileInput from '../../../../components/input/ToolFileInput';
import ToolFileResult from '../../../../components/result/ToolFileResult';

const initialValues = {
  rgba: [0, 0, 0, 0]
};
const validationSchema = Yup.object({
  // splitSeparator: Yup.string().required('The separator is required')
});
export default function ChangeColorsInPng() {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  useEffect(() => {
    if (input) {
      const processImage = async (file: File) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx == null) return;
        const img = new Image();

        img.src = URL.createObjectURL(file);
        await img.decode();

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data: Uint8ClampedArray = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          // Check for white pixel
          if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) {
            data[i] = 255; // Red
            data[i + 1] = 0; // Green
            data[i + 2] = 0; // Blue
          }
        }

        ctx.putImageData(imageData, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], file.name, { type: 'image/png' });
            setResult(newFile);
          }
        }, 'image/png');
      };

      processImage(input);
    }
  }, [input]);
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <ToolFileInput
            value={input}
            onChange={setInput}
            accept={['image/png']}
            title={'Input PNG'}
          />
        </Grid>
        <Grid item xs={6}>
          <ToolFileResult title={'Output PNG with new colors'} value={result} />
        </Grid>
      </Grid>
    </Box>
  );
}
