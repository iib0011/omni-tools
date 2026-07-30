import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import React, { useContext } from 'react';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import InputHeader from '../InputHeader';
import ResultFooter from './ResultFooter';
import { useTranslation } from 'react-i18next';
import Editor from '@monaco-editor/react';
import mime from 'mime';
import {
  globalInputHeight,
  codeInputHeightOffset
} from '../../config/uiConfig';

export default function ToolCodeResult({
  title = 'Result',
  value,
  language,
  extension = language,
  loading
}: {
  title?: string;
  value: string;
  language: string;
  extension?: string;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const theme = useTheme();

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => showSnackBar(t('toolTextResult.copied'), 'success'))
      .catch((err) => {
        showSnackBar(t('toolTextResult.copyFailed', { error: err }), 'error');
      });
  };

  const handleDownload = () => {
    const filename = `output-omni-tools.${extension}`;

    const mimeType = mime.getType(extension) || 'text/plain';

    const blob = new Blob([value], {
      type: mimeType
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <InputHeader title={title || t('toolTextResult.result')} />
      <Box
        height={`${globalInputHeight + codeInputHeightOffset}px`} // Same fixed height formula as ToolCodeInput, with the footer inside this box too, so both components render at an identical total height.
        sx={{
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {loading ? (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              {t('toolTextResult.loading')}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={(theme) => ({
              flex: 1,
              minHeight: 0,
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
              },
              '.codicon': {
                fontFamily: 'codicon !important'
              }
            })}
          >
            <Editor
              height="100%"
              language={language}
              theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
              value={value}
              options={{
                readOnly: true,
                domReadOnly: true,
                automaticLayout: true,
                folding: true,
                showFoldingControls: 'always',
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
        )}
        <ResultFooter handleCopy={handleCopy} handleDownload={handleDownload} />
      </Box>
    </Box>
  );
}
