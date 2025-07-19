import { Box, useTheme } from '@mui/material';
import React, { useContext, useRef } from 'react';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import InputHeader from '../InputHeader';
import InputFooter from './InputFooter';
import { useTranslation } from 'react-i18next';
import Editor from '@monaco-editor/react';
import {
  globalInputHeight,
  codeInputHeightOffset
} from '../../config/uiConfig';

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
  const theme = useTheme();

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
      <Box
        height={`${globalInputHeight + codeInputHeightOffset}px`} // The +codeInputHeightOffset compensates for internal padding/border differences between Monaco Editor and MUI TextField
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box
          sx={(theme) => ({
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'background.paper',
            '.monaco-editor': {
              height: '100% !important',
              outline: 'none !important',
              '.overflow-guard': {
                height: '100% !important',
                border:
                  theme.palette.mode === 'light'
                    ? '1px solid rgba(0, 0, 0, 0.23)'
                    : '1px solid rgba(255, 255, 255, 0.23)',
                borderRadius: 1,
                transition: theme.transitions.create(
                  ['border-color', 'background-color'],
                  {
                    duration: theme.transitions.duration.shorter
                  }
                )
              },
              '&:hover .overflow-guard': {
                borderColor: theme.palette.text.primary
              }
            },
            '.decorationsOverviewRuler': {
              display: 'none !important'
            }
          })}
        >
          <Editor
            height="100%"
            language={language}
            theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
            value={value}
            onChange={(value) => onChange(value ?? '')}
            options={{
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
                alwaysConsumeMouseWheel: false
              }
            }}
          />
        </Box>
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
