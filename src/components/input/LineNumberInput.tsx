import { Box, styled, TextField } from '@mui/material';
import React, { useContext, useRef } from 'react';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import InputHeader from '../InputHeader';
import InputFooter from './InputFooter';
import { useTranslation } from 'react-i18next';

const LineNumberWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  backgroundColor: theme.palette.background.paper,
  '.line-numbers': {
    whiteSpace: 'pre',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40px',
    backgroundColor: theme.palette.action.hover,
    borderRight: `1px solid ${theme.palette.divider}`,
    textAlign: 'right',
    paddingRight: '8px',
    paddingTop: '16px', // Align with TextField content
    paddingBottom: '8px',
    color: theme.palette.text.secondary,
    userSelect: 'none',
    fontSize: '14px',
    lineHeight: '1.5em',
    fontFamily: 'monospace',
    zIndex: 1,
    overflow: 'hidden'
  },
  '.MuiTextField-root': {
    position: 'relative',
    '& .MuiInputBase-root': {
      paddingLeft: '48px',
      fontFamily: 'monospace',
      fontSize: '14px',
      lineHeight: '1.5em'
    },
    '& .MuiInputBase-input': {
      lineHeight: '1.5em'
    }
  }
}));

export default function LineNumberInput({
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
  const { t } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => showSnackBar(t('toolTextInput.copied'), 'success'))
      .catch((err) => {
        showSnackBar(t('toolTextInput.copyFailed', { error: err }), 'error');
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

  // Generate line numbers based on the content
  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join(
    '\n'
  );

  return (
    <Box>
      <InputHeader title={title || t('toolTextInput.input')} />
      <LineNumberWrapper>
        <pre className="line-numbers">{lineNumbers}</pre>
        <TextField
          value={value}
          onChange={(event) => onChange(event.target.value)}
          fullWidth
          multiline
          rows={10}
          placeholder={placeholder || t('toolTextInput.placeholder')}
          sx={{
            '&.MuiTextField-root': {
              backgroundColor: 'background.paper'
            }
          }}
          inputProps={{
            'data-testid': 'text-input'
          }}
        />
      </LineNumberWrapper>
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
