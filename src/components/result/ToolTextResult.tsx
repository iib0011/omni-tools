import Typography from '@mui/material/Typography';
import { Box, Stack, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import React from 'react';

export default function ToolTextResult({
  title = 'Result',
  value
}: {
  title?: string;
  value: string;
}) {
  return (
    <Box>
      <Typography fontSize={30} color={'primary'}>
        {title}
      </Typography>
      <TextField value={value} fullWidth multiline rows={10} />
      <Stack mt={1} direction={'row'} spacing={2}>
        <Button startIcon={<DownloadIcon />}>Save as</Button>
        <Button startIcon={<ContentPasteIcon />}>Copy to clipboard</Button>
      </Stack>
    </Box>
  );
}
