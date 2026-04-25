import React, { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import BaseFileInput from './BaseFileInput';
import { BaseFileInputProps } from './file-input-utils';
import { AUDIO_FORMATS } from 'pages/tools/converters/audio-converter/types';

interface AudioFileInputProps extends Omit<BaseFileInputProps, 'accept'> {
  accept?: string[];
}

const AUDIO_ACCEPT_TYPES = [
  'audio/*',
  ...Object.keys(AUDIO_FORMATS).map((format) => `.${format}`)
];

export default function ToolAudioInput({
  accept = AUDIO_ACCEPT_TYPES,
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
