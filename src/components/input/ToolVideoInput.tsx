import React, { useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import BaseFileInput from './BaseFileInput';
import { BaseFileInputProps, formatTime } from './file-input-utils';

interface VideoFileInputProps extends BaseFileInputProps {
  showTrimControls?: boolean;
  onTrimChange?: (trimStart: number, trimEnd: number) => void;
  trimStart?: number;
  trimEnd?: number;
}

export default function ToolVideoInput({
  showTrimControls = false,
  onTrimChange,
  trimStart = 0,
  trimEnd = 100,
  ...props
}: VideoFileInputProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);

  const onVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const duration = e.currentTarget.duration;
    setVideoDuration(duration);

    if (onTrimChange && trimStart === 0 && trimEnd === 100) {
      onTrimChange(0, duration);
    }
  };

  const handleTrimChange = (start: number, end: number) => {
    if (onTrimChange) {
      onTrimChange(start, end);
    }
  };

  return (
    <BaseFileInput {...props} type={'video'}>
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
          <video
            ref={videoRef}
            src={preview}
            style={{
              maxWidth: '100%',
              maxHeight: showTrimControls ? 'calc(100% - 50px)' : '100%'
            }}
            onLoadedMetadata={onVideoLoad}
            controls={!showTrimControls}
          />

          {showTrimControls && videoDuration > 0 && (
            <Box
              sx={{
                width: '100%',
                padding: '10px 20px',
                position: 'absolute',
                bottom: 0,
                left: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="caption">
                  Start: {formatTime(trimStart || 0)}
                </Typography>
                <Typography variant="caption">
                  End: {formatTime(trimEnd || videoDuration)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <div
                  className="range-slider-container"
                  style={{ margin: '20px 0', width: '100%' }}
                >
                  <Slider
                    range
                    min={0}
                    max={videoDuration}
                    step={0.1}
                    value={[trimStart || 0, trimEnd || videoDuration]}
                    onChange={(values) => {
                      if (Array.isArray(values)) {
                        handleTrimChange(values[0], values[1]);
                      }
                    }}
                    allowCross={false}
                    pushable={0.1}
                  />
                </div>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </BaseFileInput>
  );
}
