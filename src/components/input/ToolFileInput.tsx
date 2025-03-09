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
  onCropChange
}: ToolFileInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const theme = useTheme();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);

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

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const clipboardItems = event.clipboardData?.items ?? [];
      const item = clipboardItems[0];
      if (item && item.type.includes('image')) {
        const file = item.getAsFile();
        if (file) onChange(file);
      }
    };
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [onChange]);

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
            {showCropOverlay ? (
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
              Click here to select an image from your device, press Ctrl+V to
              use an image from your clipboard, drag and drop a file from
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
