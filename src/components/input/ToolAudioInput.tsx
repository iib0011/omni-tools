import React, { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import BaseFileInput from './BaseFileInput';
import { BaseFileInputProps } from './file-input-utils';

interface AudioFileInputProps extends Omit<BaseFileInputProps, 'accept'> {
  accept?: string[];
}

export default function ToolAudioInput({
  accept = ['audio/*', '.mp3', '.wav', '.aac'],
  ...props
}: AudioFileInputProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <BaseFileInput {...props} type={'audio'} accept={accept}>
      {({ preview }) => (
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
          {preview ? (
            <audio
              ref={audioRef}
              src={preview}
              style={{ maxWidth: '100%' }}
              controls
            />
          ) : (
            <Typography variant="body2" color="textSecondary">
              Drag & drop or import an audio file
            </Typography>
          )}
        </Box>
      )}
    </BaseFileInput>
  );
}
