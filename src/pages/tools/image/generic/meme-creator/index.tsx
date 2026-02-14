import React, { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ColorSelector from '@components/options/ColorSelector';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { debounce } from 'lodash';
import * as Yup from 'yup';
import { updateNumberField } from '@utils/string';

type InitialValuesType = {
  text: string;
  fontSize: number;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  textX: number;
  textY: number;
};

const initialValues: InitialValuesType = {
  text: '',
  fontSize: 40,
  textColor: '#FFFFFF',
  strokeColor: '#000000',
  strokeWidth: 2,
  textX: 50,
  textY: 50
};

const validationSchema = Yup.object().shape({
  fontSize: Yup.number()
    .min(10, 'Font size must be at least 10px')
    .max(200, 'Font size must be at most 200px')
    .required('Font size is required'),
  strokeWidth: Yup.number()
    .min(0, 'Stroke width must be at least 0')
    .max(10, 'Stroke width must be at most 10')
    .required('Stroke width is required'),
  textX: Yup.number()
    .min(0, 'Horizontal position must be at least 0%')
    .max(100, 'Horizontal position must be at most 100%')
    .required('Horizontal position is required'),
  textY: Yup.number()
    .min(0, 'Vertical position must be at least 0%')
    .max(100, 'Vertical position must be at most 100%')
    .required('Vertical position is required')
});

export default function MemeCreator({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const drawTextOnImage = useCallback(
    async (file: File, options: InitialValuesType): Promise<void> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = URL.createObjectURL(file);

      try {
        await img.decode();

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the image first
        ctx.drawImage(img, 0, 0);

        // Configure text style
        ctx.font = `bold ${options.fontSize}px Impact, Arial Black, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Helper function to draw text with stroke
        const drawText = (
          text: string,
          x: number,
          y: number,
          color: string,
          strokeColor: string,
          strokeWidth: number
        ) => {
          if (!text.trim()) return;

          // Draw stroke (outline)
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = strokeWidth;
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          ctx.strokeText(text, x, y);

          // Draw fill
          ctx.fillStyle = color;
          ctx.fillText(text, x, y);
        };

        // Calculate text positions
        const textX = (options.textX / 100) * canvas.width;
        const textY = (options.textY / 100) * canvas.height;

        // Draw text
        if (options.text.trim()) {
          drawText(
            options.text.toUpperCase(),
            textX,
            textY,
            options.textColor,
            options.strokeColor,
            options.strokeWidth
          );
        }

        // Convert canvas to blob and create file
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = file.name.replace(/\.[^/.]+$/, '') + '-meme.png';
              const newFile = new File([blob], fileName, {
                type: 'image/png'
              });
              setResult(newFile);
            }
          },
          'image/png',
          1.0
        );
      } catch (error) {
        console.error('Error processing image:', error);
      } finally {
        URL.revokeObjectURL(img.src);
      }
    },
    []
  );

  const compute = useCallback(
    async (options: InitialValuesType) => {
      if (!input) return;
      await drawTextOnImage(input, options);
    },
    [input, drawTextOnImage]
  );

  const debouncedCompute = useCallback(debounce(compute, 500), [compute]);

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => {
    return [
      {
        title: 'Text Content',
        component: (
          <Box>
            <TextFieldWithDesc
              value={values.text}
              onOwnChange={(val) => updateField('text', val)}
              description="Text to add to the image"
              inputProps={{
                placeholder: 'Enter text...'
              }}
              multiline
              rows={3}
            />
          </Box>
        )
      },
      {
        title: 'Text Style',
        component: (
          <Box>
            <TextFieldWithDesc
              value={values.fontSize}
              onOwnChange={(val) =>
                updateNumberField(val, 'fontSize', updateField)
              }
              description="Font size in pixels (10-200)"
              inputProps={{
                type: 'number',
                min: 10,
                max: 200
              }}
            />
            <ColorSelector
              description="Text Color"
              value={values.textColor}
              onColorChange={(val) => updateField('textColor', val)}
            />
            <ColorSelector
              description="Text Stroke/Outline Color"
              value={values.strokeColor}
              onColorChange={(val) => updateField('strokeColor', val)}
            />
            <TextFieldWithDesc
              value={values.strokeWidth}
              onOwnChange={(val) =>
                updateNumberField(val, 'strokeWidth', updateField)
              }
              description="Stroke width in pixels (0-10)"
              inputProps={{
                type: 'number',
                min: 0,
                max: 10,
                step: 0.5
              }}
            />
          </Box>
        )
      },
      {
        title: 'Text Position',
        component: (
          <Box>
            <TextFieldWithDesc
              value={values.textX}
              onOwnChange={(val) =>
                updateNumberField(val, 'textX', updateField)
              }
              description="Horizontal position (0-100%, 0 = left, 100 = right)"
              inputProps={{
                type: 'number',
                min: 0,
                max: 100
              }}
            />
            <TextFieldWithDesc
              value={values.textY}
              onOwnChange={(val) =>
                updateNumberField(val, 'textY', updateField)
              }
              description="Vertical position (0-100%, 0 = top, 100 = bottom)"
              inputProps={{
                type: 'number',
                min: 0,
                max: 100
              }}
            />
          </Box>
        )
      }
    ];
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/*']}
          title="Upload Image"
        />
      }
      resultComponent={<ToolFileResult title="Meme Result" value={result} />}
      initialValues={initialValues}
      getGroups={getGroups}
      validationSchema={validationSchema}
      compute={debouncedCompute}
      toolInfo={{
        title: 'Meme Creator',
        description:
          'Create memes by adding custom text to your images. Upload an image from your local device, add text, and position it anywhere using horizontal and vertical controls. Customize the font size, colors, and stroke. All processing happens in your browser - your images never leave your device.'
      }}
    />
  );
}
