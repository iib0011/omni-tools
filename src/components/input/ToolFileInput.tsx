import { Box, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { useContext, useEffect, useRef, useState } from 'react';
import InputHeader from '../InputHeader';
import InputFooter from './InputFooter';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import greyPattern from '@assets/grey-pattern.png';
import { globalInputHeight } from '../../config/uiConfig';

interface ToolFileInputProps {
  value: File | null;
  onChange: (file: File) => void;
  accept: string[];
  title?: string;
}

export default function ToolFileInput({
  value,
  onChange,
  accept,
  title = 'File'
}: ToolFileInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const theme = useTheme();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (value) {
      const blob = new Blob([value], { type: value.type });
      const clipboardItem = new ClipboardItem({ [value.type]: blob });

      navigator.clipboard
        .write([clipboardItem])
        .then(() => showSnackBar('File copied', 'success'))
        .catch((err) => {
          showSnackBar('Failed to copy: ' + err, 'error');
        });
    }
  };
  const handlePaste = (event: ClipboardEvent) => {
    const clipboardItems = event.clipboardData?.items ?? [];
    const item = clipboardItems[0];
    if (item.type.includes('image')) {
      const file = item.getAsFile();
      onChange(file!);
    }
  };
  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);

      // Clean up memory when the component is unmounted or the file changes
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onChange(file);
  };
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  return (
    <Box>
      <InputHeader title={title} />
      <Box
        sx={{
          width: '100%',
          height: globalInputHeight,
          border: preview ? 0 : 1,
          borderRadius: 2,
          boxShadow: '5',
          bgcolor: 'white'
        }}
      >
        {preview ? (
          <Box
            width={'100%'}
            height={'100%'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: `url(${greyPattern})`
            }}
          >
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: '100%', maxHeight: globalInputHeight }}
            />
          </Box>
        ) : (
          <Box
            onClick={handleImportClick}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 5,
              height: '100%',
              cursor: 'pointer'
            }}
          >
            <Typography color={theme.palette.grey['600']}>
              Click here to select an image from your device, press Ctrl+V to
              use an image from your clipboard, drag and drop a file from
              desktop
            </Typography>
          </Box>
        )}
      </Box>
      <InputFooter handleCopy={handleCopy} handleImport={handleImportClick} />
      <input
        ref={fileInputRef}
        style={{ display: 'none' }}
        type="file"
        accept={accept.join(',')}
        onChange={handleFileChange}
      />
    </Box>
  );
}
