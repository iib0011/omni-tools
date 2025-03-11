import { Box, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import React, { useContext, useEffect, useRef, useState } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import InputHeader from '../InputHeader';
import InputFooter from './InputFooter';
import { CustomSnackBarContext } from '../../contexts/CustomSnackBarContext';
import greyPattern from '@assets/grey-pattern.png';
import { globalInputHeight } from '../../config/uiConfig';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

interface ToolFileInputProps {
  value: File | null;
  onChange: (file: File) => void;
  accept: string[];
  title?: string;
  showCropOverlay?: boolean;
  cropShape?: 'rectangular' | 'circular';
  cropPosition?: { x: number; y: number };
  cropSize?: { width: number; height: number };
  onCropChange?: (
    position: { x: number; y: number },
    size: { width: number; height: number }
  ) => void;
  type?: 'image' | 'video' | 'audio';
  // Video specific props
  showTrimControls?: boolean;
  onTrimChange?: (trimStart: number, trimEnd: number) => void;
  trimStart?: number;
  trimEnd?: number;
}

export default function ToolFileInput({
  value,
  onChange,
  accept,
  title = 'File',
  showCropOverlay = false,
  cropShape = 'rectangular',
  cropPosition = { x: 0, y: 0 },
  cropSize = { width: 100, height: 100 },
  onCropChange,
  type = 'image',
  showTrimControls = false,
  onTrimChange,
  trimStart = 0,
  trimEnd = 100
}: ToolFileInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const theme = useTheme();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  // Convert position and size to crop format used by ReactCrop
  const [crop, setCrop] = useState<Crop>({
    unit: 'px',
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  const RATIO = imageRef.current ? imgWidth / imageRef.current.width : 1;

  useEffect(() => {
    if (imgWidth && imgHeight) {
      setCrop({
        unit: 'px',
        x: cropPosition.x / RATIO,
        y: cropPosition.y / RATIO,
        width: cropSize.width / RATIO,
        height: cropSize.height / RATIO
      });
    }
  }, [cropPosition, cropSize, imgWidth, imgHeight]);

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

  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);

      // Clean up memory when the component is unmounted or the file changes
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
      setImgWidth(0);
      setImgHeight(0);
    }
  }, [value]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onChange(file);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Handle image load to set dimensions
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    setImgWidth(width);
    setImgHeight(height);

    // Initialize crop with a centered default crop if needed
    if (!crop.width && !crop.height && onCropChange) {
      const initialCrop: Crop = {
        unit: 'px',
        x: Math.floor(width / 4),
        y: Math.floor(height / 4),
        width: Math.floor(width / 2),
        height: Math.floor(height / 2)
      };

      setCrop(initialCrop);

      // Notify parent component of initial crop
      onCropChange(
        { x: initialCrop.x, y: initialCrop.y },
        { width: initialCrop.width, height: initialCrop.height }
      );
    }
  };

  // Handle video load to set duration
  const onVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const duration = e.currentTarget.duration;
    setVideoDuration(duration);

    // Initialize trim with full duration if needed
    if (onTrimChange && trimStart === 0 && trimEnd === 100) {
      onTrimChange(0, duration);
    }
  };

  const handleCropChange = (newCrop: Crop) => {
    setCrop(newCrop);
  };

  const handleCropComplete = (crop: PixelCrop) => {
    if (onCropChange) {
      onCropChange(
        { x: Math.round(crop.x * RATIO), y: Math.round(crop.y * RATIO) },
        {
          width: Math.round(crop.width * RATIO),
          height: Math.round(crop.height * RATIO)
        }
      );
    }
  };

  const handleTrimChange = (start: number, end: number) => {
    if (onTrimChange) {
      onTrimChange(start, end);
    }
  };

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const clipboardItems = event.clipboardData?.items ?? [];
      const item = clipboardItems[0];
      if (
        item &&
        (item.type.includes('image') || item.type.includes('video'))
      ) {
        const file = item.getAsFile();
        if (file) onChange(file);
      }
    };
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [onChange]);

  // Format seconds to MM:SS format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
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
          boxShadow: '5',
          bgcolor: 'white',
          position: 'relative'
        }}
      >
        {preview ? (
          <Box
            width="100%"
            height="100%"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: `url(${greyPattern})`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {type === 'image' &&
              (showCropOverlay ? (
                <ReactCrop
                  crop={crop}
                  onChange={handleCropChange}
                  onComplete={handleCropComplete}
                  circularCrop={cropShape === 'circular'}
                  style={{ maxWidth: '100%', maxHeight: globalInputHeight }}
                >
                  <img
                    ref={imageRef}
                    src={preview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: globalInputHeight }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              ) : (
                <img
                  ref={imageRef}
                  src={preview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: globalInputHeight }}
                  onLoad={onImageLoad}
                />
              ))}
            {type === 'video' && (
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
                          pushable={0.1} // Minimum distance between handles
                        />
                      </div>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
            {type === 'audio' && (
              <audio
                src={preview}
                controls
                style={{ width: '100%', maxWidth: '500px' }}
              />
            )}
          </Box>
        ) : (
          <Box
            onClick={handleImportClick}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 5,
              height: '100%',
              cursor: 'pointer'
            }}
          >
            <Typography color={theme.palette.grey['600']}>
              Click here to select a {type} from your device, press Ctrl+V to
              use a {type} from your clipboard, drag and drop a file from
              desktop
            </Typography>
          </Box>
        )}
      </Box>
      <InputFooter handleCopy={handleCopy} handleImport={handleImportClick} />
      <input
        ref={fileInputRef}
        style={{ display: 'none' }}
        type="file"
        accept={accept.join(',')}
        onChange={handleFileChange}
      />
    </Box>
  );
}
