import { Stack } from '@mui/material';
import Button from '@mui/material/Button';
import PublishIcon from '@mui/icons-material/Publish';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import React from 'react';

export default function InputFooter({
  handleImport,
  handleCopy
}: {
  handleImport: () => void;
  handleCopy: () => void;
}) {
  return (
    <Stack mt={1} direction={'row'} spacing={2}>
      <Button onClick={handleImport} startIcon={<PublishIcon />}>
        Import from file
      </Button>
      <Button onClick={handleCopy} startIcon={<ContentPasteIcon />}>
        Copy to clipboard
      </Button>
    </Stack>
  );
}
