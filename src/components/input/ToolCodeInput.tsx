import { Box } from '@mui/material';
import React, { useContext, useRef } from 'react';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import InputHeader from '../InputHeader';
import InputFooter from './InputFooter';
import { useTranslation } from 'react-i18next';
import Editor from '@monaco-editor/react';
import { globalInputHeight } from '../../config/uiConfig';

export default function ToolCodeInput({
  value,
  onChange,
  title = 'Input text',
  language
}: {
  title?: string;
  value: string;
  language: string;
  onChange: (value: string) => void;
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

  return (
    <Box>
      <InputHeader title={title || t('toolTextInput.input')} />
      <Box height={globalInputHeight}>
        <Editor
          height={'87%'}
          language={language}
          value={value}
          onChange={(value) => onChange(value ?? '')}
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
    </Box>
  );
}
