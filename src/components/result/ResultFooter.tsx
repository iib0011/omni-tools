import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import React from 'react';
import i18n from 'i18n/i18n';

export default function ResultFooter({
  handleDownload,
  handleCopy,
  disabled,
  hideCopy
}: {
  handleDownload: () => void;
  handleCopy: () => void;
  disabled?: boolean;
  hideCopy?: boolean;
}) {
  return (
    <Stack mt={1} direction={'row'} spacing={2}>
      <Button
        disabled={disabled}
        onClick={handleDownload}
        startIcon={<DownloadIcon />}
      >
        {i18n.t('saveAs')}
      </Button>
      {!hideCopy && (
        <Button
          disabled={disabled}
          onClick={handleCopy}
          startIcon={<ContentPasteIcon />}
        >
          {i18n.t('copyToClipboard')}
        </Button>
      )}
    </Stack>
  );
}
