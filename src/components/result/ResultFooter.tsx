import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import React from 'react';

export default function ResultFooter({
  handleDownload,
  handleCopy,
  disabled,
  hideCopy,
  downloadLabel = 'Download'
}: {
  handleDownload: () => void;
  handleCopy?: () => void;
  disabled?: boolean;
  hideCopy?: boolean;
  downloadLabel?: string;
}) {
  return (
    <Stack mt={1} direction={'row'} spacing={2}>
      <Button
        disabled={disabled}
        onClick={handleDownload}
        startIcon={<DownloadIcon />}
      >
        {downloadLabel}
      </Button>
      {!hideCopy && (
        <Button
          disabled={disabled}
          onClick={handleCopy}
          startIcon={<ContentPasteIcon />}
        >
          Copy to clipboard
        </Button>
      )}
    </Stack>
  );
}
