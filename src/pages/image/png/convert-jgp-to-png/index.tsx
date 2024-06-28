import { Box } from '@mui/material';
import ToolInputAndResult from 'components/ToolInputAndResult';
import ToolFileInput from 'components/input/ToolFileInput';
import ToolFileResult from 'components/result/ToolFileResult';
import React, { useState } from 'react';
import * as Yup from 'yup';

const initialValues = {};
const validationSchema = Yup.object({
  // splitSeparator: Yup.string().required('The separator is required')
});
export default function ConvertJgpToPng() {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const onFileInputChange = (file: File): void => {
    if (!file) return;
    setInput(file);
    convertJpgToPng(file);
  };

  const convertJpgToPng = async (file: File): Promise<void> => {
    if (!file) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx == null) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const newFile = new File([blob], file.name, {
          type: 'image/png'
        });
        setResult(newFile);
      }
    }, 'image/png');
  };

  return (
    <Box>
      <ToolInputAndResult
        input={
          <ToolFileInput
            value={input}
            onChange={onFileInputChange}
            accept={['image/jpeg']}
            title={'Input JPG'}
          />
        }
        result={
          <ToolFileResult
            title={'Output PNG'}
            value={result}
            extension={'png'}
          />
        }
      />
    </Box>
  );
}
