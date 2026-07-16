import { Box, CircularProgress, TextField, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import InputHeader from '../InputHeader';
import ResultFooter from './ResultFooter';
import { replaceSpecialCharacters } from '@utils/string';
import mime from 'mime';
import { globalInputHeight } from '../../config/uiConfig';
import { useTranslation } from 'react-i18next';

export default function ToolTextResult({
  title = 'Result',
  value,
  extension = 'txt',
  keepSpecialCharacters,
  loading
}: {
  title?: string;
  value: string;
  extension?: string;
  keepSpecialCharacters?: boolean;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const copyToClipboardFallback = async (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', 'true');
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (!copied) {
      throw new Error('Clipboard copy is not supported in this browser.');
    }
  };

  const handleCopy = () => {
    const copyAction = navigator.clipboard?.writeText(value);

    if (copyAction) {
      copyAction
        .then(() => showSnackBar(t('toolTextResult.copied'), 'success'))
        .catch(async (err) => {
          try {
            await copyToClipboardFallback(value);
            showSnackBar(t('toolTextResult.copied'), 'success');
          } catch {
            showSnackBar(
              t('toolTextResult.copyFailed', { error: err }),
              'error'
            );
          }
        });
      return;
    }

    copyToClipboardFallback(value)
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
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: globalInputHeight
          }}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            {t('toolTextResult.loading')}
          </Typography>
        </Box>
      ) : (
        <TextField
          value={
            keepSpecialCharacters ? value : replaceSpecialCharacters(value)
          }
          fullWidth
          multiline
          sx={{
            '&.MuiTextField-root': {
              backgroundColor: 'background.paper'
            }
          }}
          rows={10}
          inputProps={{ 'data-testid': 'text-result' }}
        />
      )}
      <ResultFooter handleCopy={handleCopy} handleDownload={handleDownload} />
    </Box>
  );
}
