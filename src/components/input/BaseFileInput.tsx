import React, { ReactNode, useContext, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import InputHeader from '../InputHeader';
import InputFooter from './InputFooter';
import {
  BaseFileInputProps,
  createObjectURL,
  revokeObjectURL
} from './file-input-utils';
import { globalInputHeight } from '../../config/uiConfig';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import greyPattern from '@assets/grey-pattern.png';

interface BaseFileInputComponentProps extends BaseFileInputProps {
  children: (props: { preview: string | undefined }) => ReactNode;
  type: 'image' | 'video' | 'audio';
}

export default function BaseFileInput({
  value,
  onChange,
  accept,
  title,
  children,
  type
}: BaseFileInputComponentProps) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const theme = useTheme();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  useEffect(() => {
    if (value) {
      const objectUrl = createObjectURL(value);
      setPreview(objectUrl);

      return () => revokeObjectURL(objectUrl);
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

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const clipboardItems = event.clipboardData?.items ?? [];
      const item = clipboardItems[0];
      if (
        item &&
        (item.type.includes('image') || item.type.includes('video'))
      ) {
        const file = item.getAsFile();
        if (file) onChange(file);
      }
    };
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [onChange]);

  return (
    <Box>
      <InputHeader
        title={title || 'Input ' + type.charAt(0).toUpperCase() + type.slice(1)}
      />
      <Box
        sx={{
          width: '100%',
          height: globalInputHeight,
          border: preview ? 0 : 1,
          borderRadius: 2,
          boxShadow: '5',
          bgcolor: 'white',
          position: 'relative'
        }}
      >
        {preview ? (
          <Box
            width="100%"
            height="100%"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: `url(${greyPattern})`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {children({ preview })}
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
              Click here to select a {type} from your device, press Ctrl+V to
              use a {type} from your clipboard, drag and drop a file from
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
