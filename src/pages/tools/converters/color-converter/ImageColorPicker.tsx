import React, { useRef, useState, useCallback } from 'react';
import { Box, Button, Typography, Paper, Chip, Tooltip } from '@mui/material';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import CloseIcon from '@mui/icons-material/Close';
import { rgbToHex } from './service';

interface ImageColorPickerProps {
  onColorPicked: (hex: string) => void;
}

export default function ImageColorPicker({
  onColorPicked
}: ImageColorPickerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(
    null
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Upload ───────────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(URL.createObjectURL(file));
    setPickedColor(null);
    setCrosshair(null);
  }

  function handleClear() {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setPickedColor(null);
    setCrosshair(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ─── Desenha imagem no canvas ao carregar ─────────────────────────────────

  function handleImageLoad() {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
  }

  // ─── Pick de cor via click no canvas ─────────────────────────────────────

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      // escala do canvas natural vs tamanho exibido
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
      const hex = rgbToHex({ r, g, b });

      setPickedColor(hex);
      setCrosshair({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height
      });
      onColorPicked(hex);
    },
    [onColorPicked]
  );

  // ─── Hover: mostra preview da cor sob o cursor ────────────────────────────

  const [hoverColor, setHoverColor] = useState<string | null>(null);

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
      setHoverColor(rgbToHex({ r, g, b }));
    },
    []
  );

  function handleCanvasMouseLeave() {
    setHoverColor(null);
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box>
      <Typography fontSize={13} fontWeight={600} mb={1} color="text.secondary">
        Pick from image
      </Typography>

      {!imageUrl ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<ImageSearchIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ fontSize: 12 }}
          >
            Import image
          </Button>
        </>
      ) : (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 2, overflow: 'hidden', position: 'relative' }}
        >
          {/* imagem oculta usada só para carregar pixels no canvas */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="color source"
            style={{ display: 'none' }}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
          />

          {/* canvas clicável */}
          <Box sx={{ position: 'relative', lineHeight: 0 }}>
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
              style={{
                width: '100%',
                maxHeight: 320,
                objectFit: 'contain',
                cursor: 'crosshair',
                display: 'block'
              }}
            />

            {/* crosshair no ponto clicado */}
            {crosshair && (
              <Box
                sx={{
                  position: 'absolute',
                  left: `${crosshair.x * 100}%`,
                  top: `${crosshair.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: '2px solid white',
                  boxShadow: '0 0 0 1px black',
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* preview da cor sob o cursor */}
            {hoverColor && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  pointerEvents: 'none'
                }}
              >
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: 0.5,
                    backgroundColor: hoverColor,
                    border: '1px solid rgba(255,255,255,0.4)'
                  }}
                />
                <Typography fontSize={12} color="white" fontFamily="monospace">
                  {hoverColor}
                </Typography>
              </Box>
            )}
          </Box>

          {/* barra inferior: cor selecionada + limpar */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={1.5}
            py={1}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          >
            {pickedColor ? (
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 0.5,
                    backgroundColor: pickedColor,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                />
                <Typography fontSize={13} fontFamily="monospace">
                  {pickedColor}
                </Typography>
                <Chip
                  label="applied"
                  size="small"
                  color="success"
                  sx={{ fontSize: 11, height: 18 }}
                />
              </Box>
            ) : (
              <Typography fontSize={12} color="text.secondary">
                Click anywhere on the image to pick a color
              </Typography>
            )}

            <Tooltip title="Remove image">
              <Button
                size="small"
                variant="text"
                color="error"
                startIcon={<CloseIcon fontSize="small" />}
                onClick={handleClear}
                sx={{ fontSize: 12, minWidth: 0 }}
              >
                Clear
              </Button>
            </Tooltip>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
