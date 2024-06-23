import Typography from '@mui/material/Typography';
import { Box, Stack, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import DownloadIcon from '@mui/icons-material/Download';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import React, { useContext } from 'react';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';

export default function ToolTextResult({
  title = 'Result',
  value
}: {
  title?: string;
  value: string;
}) {
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const handleCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => showSnackBar('Text copied', 'success'))
      .catch((err) => {
        showSnackBar('Failed to copy: ' + err, 'error');
      });
  };
  const handleDownload = () => {
    const filename = 'output-omni-tools.txt';

    const blob = new Blob([value], { type: 'text/plain' });
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
      <Typography fontSize={30} color={'primary'}>
        {title}
      </Typography>
      <TextField value={value} fullWidth multiline rows={10} />
      <Stack mt={1} direction={'row'} spacing={2}>
        <Button onClick={handleDownload} startIcon={<DownloadIcon />}>
          Save as
        </Button>
        <Button onClick={handleCopy} startIcon={<ContentPasteIcon />}>
          Copy to clipboard
        </Button>
      </Stack>
    </Box>
  );
}
