import { Box } from '@mui/material';
import React, { useContext } from 'react';
import InputHeader from '../InputHeader';
import greyPattern from '@assets/grey-pattern.png';
import { globalInputHeight } from '../../config/uiConfig';
import ResultFooter from './ResultFooter';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';

export default function ToolFileResult({
  title = 'Result',
  value,
  extension
}: {
  title?: string;
  value: File | null;
  extension: string;
}) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  React.useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleCopy = () => {
    if (value) {
      const blob = new Blob([value], { type: value.type });
      const clipboardItem = new ClipboardItem({ [value.type]: blob });

      navigator.clipboard
        .write([clipboardItem])
        .then(() => showSnackBar('File copied', 'success'))
        .catch((err) => {
          showSnackBar('Failed to copy: ' + err, 'error');
        });
    }
  };

  const handleDownload = () => {
    if (value) {
      const filename = 'output-omni-tools.' + extension;

      const blob = new Blob([value], { type: value.type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };
  return (
    <Box>
      <InputHeader title={title} />
      <Box
        sx={{
          width: '100%',
          height: globalInputHeight,
          border: preview ? 0 : 1,
          borderRadius: 2,
          boxShadow: '5'
        }}
      >
        {preview && (
          <Box
            width={'100%'}
            height={'100%'}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: `url(${greyPattern})`
            }}
          >
            <img
              src={preview}
              alt="Result"
              style={{ maxWidth: '100%', maxHeight: globalInputHeight }}
            />
          </Box>
        )}
      </Box>
      <ResultFooter
        disabled={!value}
        handleCopy={handleCopy}
        handleDownload={handleDownload}
      />
    </Box>
  );
}
