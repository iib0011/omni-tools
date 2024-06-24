import { Box } from '@mui/material';
import React from 'react';
import InputHeader from '../InputHeader';
import greyPattern from '@assets/grey-pattern.png';

export default function ToolFileResult({
  title = 'Result',
  value
}: {
  title?: string;
  value: File | null;
}) {
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [value]);

  return (
    <Box>
      <InputHeader title={title} />
      <Box
        sx={{
          width: '100%',
          height: 250,
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
              style={{ maxWidth: '100%', maxHeight: 250 }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
