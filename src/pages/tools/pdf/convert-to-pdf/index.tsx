import {
  Box,
  Slider,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack
} from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolImageInput from 'components/input/ToolImageInput';
import ToolFileResult from 'components/result/ToolFileResult';
import { ToolComponentProps } from '@tools/defineTool';
import { FormValues, Orientation, PageType, initialValues } from './types';
import { buildPdf } from './service';

const initialFormValues: FormValues = initialValues;

export default function ConvertToPdf({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [imageSize, setImageSize] = useState<{
    widthMm: number;
    heightMm: number;
    widthPx: number;
    heightPx: number;
  } | null>(null);

  const compute = async (values: FormValues) => {
    if (!input) return;
    const { pdfFile, imageSize } = await buildPdf({
      file: input,
      pageType: values.pageType,
      orientation: values.orientation,
      scale: values.scale
    });
    setResult(pdfFile);
    setImageSize(imageSize);
  };

  return (
    <ToolContent<FormValues, File | null>
      title={title}
      input={input}
      setInput={setInput}
      initialValues={initialFormValues}
      compute={compute}
      inputComponent={
        <Box>
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
            title="Input Image"
          />
        </Box>
      }
      getGroups={({ values, updateField }) => {
        return [
          {
            title: '',
            component: (
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h6">PDF Type</Typography>
                  <RadioGroup
                    row
                    value={values.pageType}
                    onChange={(e) =>
                      updateField('pageType', e.target.value as PageType)
                    }
                  >
                    <FormControlLabel
                      value="full"
                      control={<Radio />}
                      label="Full Size (Same as Image)"
                    />
                    <FormControlLabel
                      value="a4"
                      control={<Radio />}
                      label="A4 Page"
                    />
                  </RadioGroup>

                  {values.pageType === 'full' && imageSize && (
                    <Typography variant="body2" color="text.secondary">
                      Image size: {imageSize.widthMm.toFixed(1)} ×{' '}
                      {imageSize.heightMm.toFixed(1)} mm ({imageSize.widthPx} ×{' '}
                      {imageSize.heightPx} px)
                    </Typography>
                  )}
                </Box>

                {values.pageType === 'a4' && (
                  <Box>
                    <Typography variant="h6">Orientation</Typography>
                    <RadioGroup
                      row
                      value={values.orientation}
                      onChange={(e) =>
                        updateField(
                          'orientation',
                          e.target.value as Orientation
                        )
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
                )}

                {values.pageType === 'a4' && (
                  <Box>
                    <Typography variant="h6">Scale</Typography>
                    <Typography>Scale image: {values.scale}%</Typography>
                    <Slider
                      value={values.scale}
                      onChange={(_, v) => updateField('scale', v as number)}
                      min={10}
                      max={100}
                      step={1}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                )}
              </Stack>
            )
          }
        ] as const;
      }}
      resultComponent={
        <ToolFileResult title="Output PDF" value={result} extension="pdf" />
      }
    />
  );
}
