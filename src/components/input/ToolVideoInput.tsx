import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import BaseFileInput from './BaseFileInput';
import { BaseFileInputProps, formatTime } from './file-input-utils';
import Cropper, { MediaSize, Point, Size, Area } from 'react-easy-crop';

interface VideoFileInputProps extends BaseFileInputProps {
  showTrimControls?: boolean;
  onTrimChange?: (trimStart: number, trimEnd: number) => void;
  trimStart?: number;
  trimEnd?: number;
  showCropOverlay?: boolean;
  cropPosition?: { x: number; y: number };
  cropSize?: { width: number; height: number };
  onCropChange?: (
    position: { x: number; y: number },
    size: { width: number; height: number }
  ) => void;
}

export default function ToolVideoInput({
  showTrimControls = false,
  onTrimChange,
  trimStart = 0,
  trimEnd = 100,
  showCropOverlay,
  cropPosition = { x: 0, y: 0 },
  cropSize = { width: 100, height: 100 },
  onCropChange,
  ...props
}: VideoFileInputProps) {
  let videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);

  const [crop, setCrop] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const onVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const duration = e.currentTarget.duration;
    setVideoDuration(duration);

    if (onTrimChange && trimStart === 0 && trimEnd === 100) {
      onTrimChange(0, duration);
    }
  };
  useEffect(() => {
    if (
      cropPosition.x !== 0 ||
      cropPosition.y !== 0 ||
      cropSize.width !== 100 ||
      cropSize.height !== 100
    ) {
      setCrop({ ...cropPosition, ...cropSize });
    }
  }, [cropPosition, cropSize]);

  const onCropMediaLoaded = (mediaSize: MediaSize) => {
    const { width, height } = mediaSize;
    setVideoWidth(width);
    setVideoHeight(height);
    if (!crop.width && !crop.height && onCropChange) {
      const initialCrop = {
        x: Math.floor(width / 4),
        y: Math.floor(height / 4),
        width: Math.floor(width / 2),
        height: Math.floor(height / 2)
      };
      console.log('initialCrop', initialCrop);
      setCrop(initialCrop);

      onCropChange(
        { x: initialCrop.x, y: initialCrop.y },
        { width: initialCrop.width, height: initialCrop.height }
      );
    }
  };
  const handleTrimChange = (start: number, end: number) => {
    if (onTrimChange) {
      onTrimChange(start, end);
    }
  };

  const handleCropChange = (newCrop: Point) => {
    setCrop((prevState) => ({ ...prevState, x: newCrop.x, y: newCrop.y }));
  };
  const handleCropSizeChange = (newCrop: Size) => {
    setCrop((prevState) => ({
      ...prevState,
      height: newCrop.height,
      width: newCrop.width
    }));
  };

  const handleCropComplete = (crop: Area, croppedAreaPixels: Area) => {
    if (onCropChange) {
      onCropChange(croppedAreaPixels, croppedAreaPixels);
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
          {showCropOverlay ? (
            <Cropper
              setVideoRef={(ref) => {
                videoRef = ref;
              }}
              video={preview}
              crop={crop}
              cropSize={crop}
              onCropSizeChange={handleCropSizeChange}
              onCropChange={handleCropChange}
              onCropComplete={handleCropComplete}
              onMediaLoaded={onCropMediaLoaded}
              initialCroppedAreaPercentages={{
                height: 0.5,
                width: 0.5,
                x: 0.5,
                y: 0.5
              }}
              // controls={!showTrimControls}
            />
          ) : (
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
          )}

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
