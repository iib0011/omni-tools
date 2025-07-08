import { Box, TextField } from '@mui/material';
import React, { useContext, useRef } from 'react';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import InputHeader from '../InputHeader';
import InputFooter from './InputFooter';

export default function ToolTextInput({
  value,
  onChange,
  title = 'Input text',
  placeholder
}: {
  title?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => showSnackBar('Text copied', 'success'))
      .catch((err) => {
        showSnackBar('Failed to copy: ' + err, 'error');
      });
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          onChange(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  return (
    <Box>
      <InputHeader title={title} />
      <TextField
        value={value}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        placeholder={placeholder}
        multiline
        rows={10}
        sx={{
          '&.MuiTextField-root': {
            backgroundColor: 'background.paper'
          }
        }}
        inputProps={{
          'data-testid': 'text-input'
        }}
      />
      <InputFooter handleCopy={handleCopy} handleImport={handleImportClick} />
      <input
        type="file"
        accept="*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </Box>
  );
}
