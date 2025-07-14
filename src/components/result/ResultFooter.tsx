import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ResultFooter({
  handleDownload,
  handleCopy,
  disabled,
  hideCopy,
  downloadLabel
}: {
  handleDownload: () => void;
  handleCopy?: () => void;
  disabled?: boolean;
  hideCopy?: boolean;
  downloadLabel?: string;
}) {
  const { t } = useTranslation();
  return (
    <Stack mt={1} direction={'row'} spacing={2}>
      <Button
        disabled={disabled}
        onClick={handleDownload}
        startIcon={<DownloadIcon />}
      >
        {downloadLabel || t('resultFooter.download')}
      </Button>
      {!hideCopy && (
        <Button
          disabled={disabled}
          onClick={handleCopy}
          startIcon={<ContentPasteIcon />}
        >
          {t('resultFooter.copy')}
        </Button>
      )}
    </Stack>
  );
}
