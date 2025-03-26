import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import BaseFileInput from './BaseFileInput';
import { BaseFileInputProps } from './file-input-utils';
import { globalInputHeight } from '../../config/uiConfig';

interface ImageFileInputProps extends BaseFileInputProps {
  showCropOverlay?: boolean;
  cropShape?: 'rectangular' | 'circular';
  cropPosition?: { x: number; y: number };
  cropSize?: { width: number; height: number };
  onCropChange?: (
    position: { x: number; y: number },
    size: { width: number; height: number }
  ) => void;
}

export default function ToolImageInput({
  showCropOverlay = false,
  cropShape = 'rectangular',
  cropPosition = { x: 0, y: 0 },
  cropSize = { width: 100, height: 100 },
  onCropChange,
  ...props
}: ImageFileInputProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);

  const [crop, setCrop] = useState<Crop>({
    unit: 'px',
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  const RATIO = imageRef.current ? imgWidth / imageRef.current.width : 1;

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    setImgWidth(width);
    setImgHeight(height);

    if (!crop.width && !crop.height && onCropChange) {
      const initialCrop: Crop = {
        unit: 'px',
        x: Math.floor(width / 4),
        y: Math.floor(height / 4),
        width: Math.floor(width / 2),
        height: Math.floor(height / 2)
      };

      setCrop(initialCrop);

      onCropChange(
        { x: initialCrop.x, y: initialCrop.y },
        { width: initialCrop.width, height: initialCrop.height }
      );
    }
  };
  useEffect(() => {
    if (
      imgWidth &&
      imgHeight &&
      (cropPosition.x !== 0 ||
        cropPosition.y !== 0 ||
        cropSize.width !== 100 ||
        cropSize.height !== 100)
    ) {
      setCrop({
        unit: 'px',
        x: cropPosition.x / RATIO,
        y: cropPosition.y / RATIO,
        width: cropSize.width / RATIO,
        height: cropSize.height / RATIO
      });
    }
  }, [cropPosition, cropSize, imgWidth, imgHeight, RATIO]);

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

  return (
    <BaseFileInput {...props} type={'image'}>
      {({ preview }) => (
        <Box
          width="100%"
          height="100%"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
      )}
    </BaseFileInput>
  );
}
