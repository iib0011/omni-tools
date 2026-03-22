import { Box, Button, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import SimpleRadio from '@components/options/SimpleRadio';
import { processImage } from './service';
import { InitialValuesType } from './types';

const initialValues: InitialValuesType = {
  watermarkOpacity: 0.35,
  fontSize: 32,
  position: 'bottom-right',
  color: '#ffffff'
};

const validationSchema = Yup.object({
  watermarkOpacity: Yup.number()
    .min(0, 'Opacity must be between 0 and 1')
    .max(1, 'Opacity must be between 0 and 1')
    .required('Opacity is required'),
  fontSize: Yup.number()
    .min(8, 'Font size must be at least 8px')
    .max(512, 'Font size is too large')
    .required('Font size is required'),
  color: Yup.string().required('Color is required')
});

export default function BatchWatermark({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File[]>([]);
  const [results, setResults] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const compute = async (optionsValues: InitialValuesType, files: File[]) => {
    if (!files || files.length === 0) return;

    const out: File[] = [];
    for (const f of files) {
      const processed = await processImage(f, optionsValues);
      if (processed) out.push(processed);
    }
    setResults(out);
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Watermark appearance',
      component: (
        <Box>
          <TextFieldWithDesc
            value={String(values.watermarkOpacity)}
            onOwnChange={(val) => updateField('watermarkOpacity', Number(val))}
            description={'Opacity (0 to 1). Example: 0.35'}
            inputProps={{
              'data-testid': 'opacity-input',
              type: 'number',
              min: 0,
              max: 1,
              step: 0.05
            }}
          />
          <TextFieldWithDesc
            value={String(values.fontSize)}
            onOwnChange={(val) => updateField('fontSize', Number(val))}
            description={'Font size in pixels'}
            inputProps={{
              'data-testid': 'font-size-input',
              type: 'number',
              min: 8,
              max: 512,
              step: 1
            }}
          />
          <TextFieldWithDesc
            value={values.color}
            onOwnChange={(val) => updateField('color', val)}
            description={'Text color (hex). Example: #ffffff'}
            inputProps={{
              'data-testid': 'color-input'
            }}
          />
        </Box>
      )
    },
    {
      title: 'Position',
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('position', 'bottom-right')}
            checked={values.position === 'bottom-right'}
            description={'Bottom-right corner'}
            title={'Bottom-right'}
          />
          <SimpleRadio
            onClick={() => updateField('position', 'bottom-left')}
            checked={values.position === 'bottom-left'}
            description={'Bottom-left corner'}
            title={'Bottom-left'}
          />
          <SimpleRadio
            onClick={() => updateField('position', 'top-right')}
            checked={values.position === 'top-right'}
            description={'Top-right corner'}
            title={'Top-right'}
          />
          <SimpleRadio
            onClick={() => updateField('position', 'top-left')}
            checked={values.position === 'top-left'}
            description={'Top-left corner'}
            title={'Top-left'}
          />
          <SimpleRadio
            onClick={() => updateField('position', 'center')}
            checked={values.position === 'center'}
            description={'Centered on the image'}
            title={'Center'}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      input={input}
      validationSchema={validationSchema}
      inputComponent={
        <Box>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              setInput(files);
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose files
            </Button>

            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {input.length === 0 && 'No files selected'}
              {input.length > 0 && `${input.length} file(s) selected`}
            </Typography>

            {input.length > 0 && (
              <Button
                variant="text"
                onClick={() => {
                  setInput([]);
                  setResults([]);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Clear
              </Button>
            )}
          </Box>

          {input.length > 0 && (
            <Box sx={{ mt: 1, fontSize: 14, opacity: 0.85 }}>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {input.map((f) => (
                  <li key={`${f.name}-${f.size}-${f.lastModified}`}>
                    {f.name}
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Box>
      }
      resultComponent={
        <Box>
          {results.map((file) => (
            <Box key={file.name} sx={{ mb: 2 }}>
              <ToolFileResult
                title={file.name}
                value={file}
                extension={file.name.split('.').pop() || 'png'}
              />
            </Box>
          ))}
        </Box>
      }
      toolInfo={{
        title: 'Batch watermark images (filename)',
        description:
          'Uploads multiple images and adds a text watermark based on each file’s name.'
      }}
    />
  );
}
