import { Box } from '@mui/material';
import ToolInputAndResult from 'components/ToolInputAndResult';
import ToolFileInput from 'components/input/ToolFileInput';
import CheckboxWithDesc from 'components/options/CheckboxWithDesc';
import ColorSelector from 'components/options/ColorSelector';
import TextFieldWithDesc from 'components/options/TextFieldWithDesc';
import ToolOptions from 'components/options/ToolOptions';
import ToolFileResult from 'components/result/ToolFileResult';
import Color from 'color';
import React, { useState } from 'react';
import * as Yup from 'yup';

const initialValues = {
  enableTransparency: false,
  color: 'white',
  similarity: '10'
};
const validationSchema = Yup.object({
  // splitSeparator: Yup.string().required('The separator is required')
});
export default function ConvertJgpToPng() {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const compute = async (
    optionsValues: typeof initialValues,
    input: any
  ): Promise<void> => {
    if (!input) return;

    const processImage = async (
      file: File,
      transparencyTransform?: {
        color: [number, number, number];
        similarity: number;
      }
    ) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx == null) return;
      const img = new Image();

      img.src = URL.createObjectURL(file);
      await img.decode();

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (transparencyTransform) {
        const { color, similarity } = transparencyTransform;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data: Uint8ClampedArray = imageData.data;

        const colorDistance = (
          c1: [number, number, number],
          c2: [number, number, number]
        ) => {
          return Math.sqrt(
            Math.pow(c1[0] - c2[0], 2) +
              Math.pow(c1[1] - c2[1], 2) +
              Math.pow(c1[2] - c2[2], 2)
          );
        };
        const maxColorDistance = Math.sqrt(
          Math.pow(255, 2) + Math.pow(255, 2) + Math.pow(255, 2)
        );
        const similarityThreshold = (similarity / 100) * maxColorDistance;

        for (let i = 0; i < data.length; i += 4) {
          const currentColor: [number, number, number] = [
            data[i],
            data[i + 1],
            data[i + 2]
          ];
          if (colorDistance(currentColor, color) <= similarityThreshold) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], file.name, {
            type: 'image/png'
          });
          setResult(newFile);
        }
      }, 'image/png');
    };

    if (optionsValues.enableTransparency) {
      let rgb: [number, number, number];
      try {
        //@ts-ignore
        rgb = Color(optionsValues.color).rgb().array();
      } catch (err) {
        return;
      }

      processImage(input, {
        color: rgb,
        similarity: Number(optionsValues.similarity)
      });
    } else {
      processImage(input);
    }
  };

  return (
    <Box>
      <ToolInputAndResult
        input={
          <ToolFileInput
            value={input}
            onChange={setInput}
            accept={['image/jpeg']}
            title={'Input JPG'}
          />
        }
        result={
          <ToolFileResult
            title={'Output PNG'}
            value={result}
            extension={'png'}
          />
        }
      />
      <ToolOptions
        compute={compute}
        getGroups={({ values, updateField }) => [
          {
            title: 'From color and to color',
            component: (
              <Box>
                <CheckboxWithDesc
                  key="enableTransparency"
                  title="PNG Transparency Color"
                  checked={!!values.enableTransparency}
                  onChange={(value) => updateField('enableTransparency', value)}
                  description="Make the color below transparent."
                />
                <ColorSelector
                  value={values.color}
                  onChange={(val) => updateField('color', val)}
                  description={'With this color (to color)'}
                />
                <TextFieldWithDesc
                  value={values.similarity}
                  onOwnChange={(val) => updateField('similarity', val)}
                  description={
                    'Match this % of similar. For example, 10% white will match white and a little bit of gray.'
                  }
                />
              </Box>
            )
          }
        ]}
        initialValues={initialValues}
        input={input}
        validationSchema={validationSchema}
      />
    </Box>
  );
}
