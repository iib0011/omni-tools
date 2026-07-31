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
import ToolMultipleImageInput, {
  MultiImageInput
} from '@components/input/ToolMultipleImageInput';
import ToolFileResult from 'components/result/ToolFileResult';
import { ToolComponentProps } from '@tools/defineTool';
import { Orientation, PageType, InitialValuesType, ImageSize } from './types';
import { buildPdf } from './service';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  pageType: 'full',
  orientation: 'portrait',
  scale: 100
};

export default function ConvertToPdf({ title }: ToolComponentProps) {
  const { t } = useTranslation('pdf');
  const [input, setInput] = useState<MultiImageInput[]>([]);
  const [result, setResult] = useState<File | null>(null);
  const [imageSizes, setImageSizes] = useState<ImageSize[] | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const compute = async (
    optionsValues: InitialValuesType,
    input: MultiImageInput[]
  ) => {
    if (!input.length) return;

    setIsProcessing(true);

    try {
      const files = input.sort((a, b) => a.order - b.order).map((i) => i.file);

      const { pdfFile, imageSizes } = await buildPdf(files, optionsValues);
      setResult(pdfFile);
      setImageSizes(imageSizes);
    } catch (error) {
      throw new Error('Error converting image(s) to PDF:' + error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolContent
      title={title}
      input={input}
      setInput={setInput}
      initialValues={initialValues}
      compute={compute}
      inputComponent={
        <Box>
          <ToolMultipleImageInput
            type="image"
            value={input}
            onChange={setInput}
            accept={[
              'image/png',
              'image/jpeg',
              'image/webp',
              'image/gif',
              'image/heic',
              'image/heif'
            ]}
            title={t('convertToPdf.inputTitle')}
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
                  <Typography variant="h6">
                    {t('convertToPdf.options.type')}
                  </Typography>
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
                      label={t('convertToPdf.options.fullsize')}
                    />
                    <FormControlLabel
                      value="a4"
                      control={<Radio />}
                      label={t('convertToPdf.options.a4')}
                    />
                  </RadioGroup>

                  {values.pageType === 'full' && imageSizes && (
                    <Stack spacing={1} mt={1}>
                      {imageSizes.map((size, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          color="text.secondary"
                        >
                          {t('convertToPdf.options.image')} {index + 1}:{' '}
                          {size.widthMm.toFixed(1)} × {size.heightMm.toFixed(1)}{' '}
                          mm ({size.widthPx} × {size.heightPx} px)
                        </Typography>
                      ))}
                    </Stack>
                  )}
                </Box>

                {values.pageType === 'a4' && (
                  <Box>
                    <Typography variant="h6">
                      {t('convertToPdf.options.orientation')}
                    </Typography>
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
                        label={t('convertToPdf.options.portrait')}
                      />
                      <FormControlLabel
                        value="landscape"
                        control={<Radio />}
                        label={t('convertToPdf.options.landscape')}
                      />
                    </RadioGroup>
                  </Box>
                )}

                {values.pageType === 'a4' && (
                  <Box>
                    <Typography variant="h6">
                      {t('convertToPdf.options.scale')}
                    </Typography>
                    <Typography>{values.scale}%</Typography>
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
        <ToolFileResult
          title={t('convertToPdf.resultTitle')}
          value={result}
          extension="pdf"
          loading={isProcessing}
        />
      }
    />
  );
}
