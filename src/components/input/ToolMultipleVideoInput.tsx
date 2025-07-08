import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import BaseFileInput from './BaseFileInput';
import { BaseFileInputProps } from './file-input-utils';
import DeleteIcon from '@mui/icons-material/Delete';

interface ToolMultipleVideoInputProps
  extends Omit<BaseFileInputProps, 'accept' | 'value' | 'onChange'> {
  value: File[] | null;
  onChange: (files: File[]) => void;
  accept?: string[];
  title?: string;
}

export default function ToolMultipleVideoInput({
  value,
  onChange,
  accept = ['video/*', '.mkv'],
  title,
  ...props
}: ToolMultipleVideoInputProps) {
  // For preview, use the first file if available
  const preview =
    value && value.length > 0 ? URL.createObjectURL(value[0]) : undefined;

  // Handler for file selection
  const handleFileChange = (file: File | null) => {
    if (file) {
      // Add to existing files, avoiding duplicates by name
      const files = value ? [...value] : [];
      if (!files.some((f) => f.name === file.name && f.size === file.size)) {
        onChange([...files, file]);
      }
    }
  };

  // Handler for removing a file
  const handleRemove = (idx: number) => {
    if (!value) return;
    const newFiles = value.slice();
    newFiles.splice(idx, 1);
    onChange(newFiles);
  };

  return (
    <BaseFileInput
      value={null} // We handle preview manually
      onChange={handleFileChange}
      accept={accept}
      title={title || 'Input Videos'}
      type="video"
      {...props}
    >
      {() => (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {preview && (
            <video
              src={preview}
              controls
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          )}
          {value && value.length > 0 && (
            <Box mt={2} width="100%">
              <Typography variant="subtitle2">Selected Videos:</Typography>
              {value.map((file, idx) => (
                <Box key={idx} display="flex" alignItems="center" mb={1}>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {file.name}
                  </Typography>
                  <IconButton size="small" onClick={() => handleRemove(idx)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </BaseFileInput>
  );
}
