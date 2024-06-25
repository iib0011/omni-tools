import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import React from 'react';

export default function ResultFooter({
  handleDownload,
  handleCopy,
  disabled
}: {
  handleDownload: () => void;
  handleCopy: () => void;
  disabled?: boolean;
}) {
  return (
    <Stack mt={1} direction={'row'} spacing={2}>
      <Button
        disabled={disabled}
        onClick={handleDownload}
        startIcon={<DownloadIcon />}
      >
        Save as
      </Button>
      <Button
        disabled={disabled}
        onClick={handleCopy}
        startIcon={<ContentPasteIcon />}
      >
        Copy to clipboard
      </Button>
    </Stack>
  );
}
