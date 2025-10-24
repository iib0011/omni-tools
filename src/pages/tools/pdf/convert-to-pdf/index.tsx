import {
  Box,
  Slider,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import ToolImageInput from 'components/input/ToolImageInput';
import ToolFileResult from 'components/result/ToolFileResult';
import React, { useState, useEffect } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import jsPDF from 'jspdf';

export default function ConvertToPdf({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [scale, setScale] = useState<number>(100);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    'portrait'
  );
  const [pageType, setPageType] = useState<'a4' | 'full'>('a4');
  const [imageSize, setImageSize] = useState<{
    widthMm: number;
    heightMm: number;
    widthPx: number;
    heightPx: number;
  } | null>(null);

  const compute = async (file: File | null, currentScale: number) => {
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    try {
      await img.decode();

      const pxToMm = (px: number) => px * 0.264583;
      const imgWidthMm = pxToMm(img.width);
      const imgHeightMm = pxToMm(img.height);
      setImageSize({
        widthMm: imgWidthMm,
        heightMm: imgHeightMm,
        widthPx: img.width,
        heightPx: img.height
      });

      const pdf =
        pageType === 'full'
          ? new jsPDF({
              orientation: imgWidthMm > imgHeightMm ? 'landscape' : 'portrait',
              unit: 'mm',
              format: [imgWidthMm, imgHeightMm]
            })
          : new jsPDF({
              orientation,
              unit: 'mm',
              format: 'a4'
            });

      pdf.setDisplayMode('fullwidth');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const widthRatio = pageWidth / img.width;
      const heightRatio = pageHeight / img.height;
      const fitScale = Math.min(widthRatio, heightRatio);

      const finalWidth =
        pageType === 'full'
          ? pageWidth
          : img.width * fitScale * (currentScale / 100);
      const finalHeight =
        pageType === 'full'
          ? pageHeight
          : img.height * fitScale * (currentScale / 100);

      const x = pageType === 'full' ? 0 : (pageWidth - finalWidth) / 2;
      const y = pageType === 'full' ? 0 : (pageHeight - finalHeight) / 2;

      pdf.addImage(img, 'JPEG', x, y, finalWidth, finalHeight);

      const blob = pdf.output('blob');
      const fileName = file.name.replace(/\.[^/.]+$/, '') + '.pdf';
      setResult(new File([blob], fileName, { type: 'application/pdf' }));
    } catch (e) {
      console.error(e);
    } finally {
      URL.revokeObjectURL(img.src);
    }
  };

  useEffect(() => {
    compute(input, scale);
  }, [input, orientation, pageType]);

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <Box display="flex" flexDirection="column" gap={3}>
          <ToolImageInput
            value={input}
            onChange={setInput}
            accept={[
              'image/png',
              'image/jpeg',
              'image/webp',
              'image/tiff',
              'image/gif',
              'image/heic',
              'image/heif',
              'image/x-adobe-dng',
              'image/x-canon-cr2',
              'image/x-nikon-nef',
              'image/x-sony-arw',
              'image/vnd.adobe.photoshop'
            ]}
            title={'Input Image'}
          />

          <Box>
            <Typography gutterBottom>PDF Type</Typography>
            <RadioGroup
              row
              value={pageType}
              onChange={(e) => setPageType(e.target.value as 'a4' | 'full')}
            >
              <FormControlLabel
                value="a4"
                control={<Radio />}
                label="A4 Page"
              />
              <FormControlLabel
                value="full"
                control={<Radio />}
                label="Full Size (Same as Image)"
              />
            </RadioGroup>

            {pageType === 'full' && imageSize && (
              <Typography variant="body2" color="text.secondary">
                Image size: {imageSize.widthMm.toFixed(1)} ×{' '}
                {imageSize.heightMm.toFixed(1)} mm ({imageSize.widthPx} ×{' '}
                {imageSize.heightPx} px)
              </Typography>
            )}
          </Box>

          {pageType === 'a4' && (
            <>
              <Box>
                <Typography gutterBottom>Orientation</Typography>
                <RadioGroup
                  row
                  value={orientation}
                  onChange={(e) =>
                    setOrientation(e.target.value as 'portrait' | 'landscape')
                  }
                >
                  <FormControlLabel
                    value="portrait"
                    control={<Radio />}
                    label="Portrait (Vertical)"
                  />
                  <FormControlLabel
                    value="landscape"
                    control={<Radio />}
                    label="Landscape (Horizontal)"
                  />
                </RadioGroup>
              </Box>

              <Box>
                <Typography gutterBottom>Scale image: {scale}%</Typography>
                <Slider
                  value={scale}
                  onChange={(_, v) => setScale(v as number)}
                  onChangeCommitted={(_, v) => compute(input, v as number)}
                  min={10}
                  max={100}
                  step={1}
                  valueLabelDisplay="auto"
                />
              </Box>
            </>
          )}
        </Box>
      }
      resultComponent={
        <ToolFileResult title={'Output PDF'} value={result} extension={'pdf'} />
      }
      compute={() => compute(input, scale)}
      setInput={setInput}
    />
  );
}
