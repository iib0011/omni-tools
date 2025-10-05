import { Box, Typography } from '@mui/material';
import InputHeader from '../InputHeader';
import ResultFooter from './ResultFooter';
import { useContext } from 'react';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value.replace(/<[^>]*>/g, ''))
      .then(() => showSnackBar(t('toolTextResult.copied'), 'success'))
      .catch((err) =>
        showSnackBar(t('toolTextResult.copyFailed', { error: err }), 'error')
      );
  };

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diff-output.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <InputHeader title={title} />
      {loading ? (
        <Typography variant="body2">{t('toolTextResult.loading')}</Typography>
      ) : isHtml ? (
        <Box
          sx={{
            p: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            '& .diff-line': {
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace'
            },
            '& .diff-added': {
              backgroundColor: '#c8f7c5' // green
            },
            '& .diff-removed': {
              backgroundColor: '#ffe0e0' // red
            }
          }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <Box
          sx={{
            p: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {value}
        </Box>
      )}
      <ResultFooter handleCopy={handleCopy} handleDownload={handleDownload} />
    </Box>
  );
}
