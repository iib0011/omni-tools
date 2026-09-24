import { Box, Typography, CircularProgress, useTheme } from '@mui/material';
import InputHeader from '../InputHeader';
import ResultFooter from './ResultFooter';
import { useContext } from 'react';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { globalInputHeight } from '../../config/uiConfig';
import { useTranslation } from 'react-i18next';
import { stripAndDecodeHtml } from 'utils/string';
import DOMPurify from 'dompurify';

const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: ['div', 'span', 'br'],
  ALLOWED_ATTR: ['class']
};

export default function ToolDiffResult({
  title = 'Differences',
  value,
  loading,
  isHtml = false
}: {
  title?: string;
  value: string;
  loading?: boolean;
  isHtml?: boolean;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const handleCopy = () => {
    const text = isHtml ? stripAndDecodeHtml(value) : value;
    navigator.clipboard
      .writeText(text)
      .then(() => showSnackBar(t('toolTextResult.copied'), 'success'))
      .catch((err) =>
        showSnackBar(t('toolTextResult.copyFailed', { error: err }), 'error')
      );
  };

  const handleDownload = () => {
    const mimeType = isHtml ? 'text/html' : 'text/plain';
    const blob = new Blob([value], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isHtml ? 'diff-output.html' : 'diff-output.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  };

  const sharedBoxSx = {
    p: 2,
    backgroundColor: 'background.paper',
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    minHeight: '265px'
  } as const;

  return (
    <Box>
      <InputHeader title={title} />
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
      ) : isHtml ? (
        <Box
          sx={{
            ...sharedBoxSx,
            '& .diff-added': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.success.dark
                  : theme.palette.success.light,
              color: theme.palette.success.contrastText
            },
            '& .diff-removed': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? theme.palette.error.dark
                  : theme.palette.error.light,
              color: theme.palette.error.contrastText
            }
          }}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(value, DOMPURIFY_CONFIG)
          }}
        />
      ) : (
        <Box sx={sharedBoxSx}>{value}</Box>
      )}
      <ResultFooter handleCopy={handleCopy} handleDownload={handleDownload} />
    </Box>
  );
}
