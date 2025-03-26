import { Box, TextField } from '@mui/material';
import React, { useContext } from 'react';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import InputHeader from '../InputHeader';
import ResultFooter from './ResultFooter';
import { replaceSpecialCharacters } from '@utils/string';
import mime from 'mime';

export default function ToolTextResult({
  title = 'Result',
  value,
  extension = 'txt'
}: {
  title?: string;
  value: string;
  extension?: string;
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
    const filename = `output-omni-tools.${extension}`;

    const mimeType = mime.getType(extension) || 'text/plain';

    const blob = new Blob([value], {
      type: mimeType
    });
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
      <InputHeader title={title} />
      <TextField
        value={replaceSpecialCharacters(value)}
        fullWidth
        multiline
        sx={{
          '&.MuiTextField-root': {
            backgroundColor: 'white'
          }
        }}
        rows={10}
        inputProps={{ 'data-testid': 'text-result' }}
      />
      <ResultFooter handleCopy={handleCopy} handleDownload={handleDownload} />
    </Box>
  );
}
