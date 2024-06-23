import { Box, Stack, TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import PublishIcon from '@mui/icons-material/Publish';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import React, { useContext, useRef } from 'react';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';

export default function ToolTextInput({
  value,
  onChange,
  title = 'Input text'
}: {
  title?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => showSnackBar('Text copied', 'success'))
      .catch((err) => {
        showSnackBar('Failed to copy: ' + err, 'error');
      });
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          onChange(text);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  return (
    <Box id="tool">
      <Typography fontSize={30} color={'primary'}>
        {title}
      </Typography>
      <TextField
        value={value}
        onChange={(event) => onChange(event.target.value)}
        fullWidth
        multiline
        rows={10}
      />
      <Stack mt={1} direction={'row'} spacing={2}>
        <Button onClick={handleImportClick} startIcon={<PublishIcon />}>
          Import from file
        </Button>
        <Button onClick={handleCopy} startIcon={<ContentPasteIcon />}>
          Copy to clipboard
        </Button>
      </Stack>
      <input
        type="file"
        accept="*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </Box>
  );
}
