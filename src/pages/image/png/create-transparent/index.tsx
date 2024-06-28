import { Box } from '@mui/material';
import React, { useState } from 'react';
import * as Yup from 'yup';
import ToolFileInput from '../../../../components/input/ToolFileInput';
import ToolFileResult from '../../../../components/result/ToolFileResult';
import ToolOptions from '../../../../components/options/ToolOptions';
import ColorSelector from '../../../../components/options/ColorSelector';
import Color from 'color';
import TextFieldWithDesc from 'components/options/TextFieldWithDesc';
import ToolInputAndResult from '../../../../components/ToolInputAndResult';

const initialValues = {
  fromColor: 'white',
  similarity: '10'
};
const validationSchema = Yup.object({
  // splitSeparator: Yup.string().required('The separator is required')
});
export default function ChangeColorsInPng() {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const compute = (optionsValues: typeof initialValues, input: any) => {
    if (!input) return;
    const { fromColor, similarity } = optionsValues;

    let fromRgb: [number, number, number];
    try {
      //@ts-ignore
      fromRgb = Color(fromColor).rgb().array();
    } catch (err) {
      return;
    }
    const processImage = async (
      file: File,
      fromColor: [number, number, number],
      similarity: number
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
        if (colorDistance(currentColor, fromColor) <= similarityThreshold) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
        }
      }

      ctx.putImageData(imageData, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], file.name, { type: 'image/png' });
          setResult(newFile);
        }
      }, 'image/png');
    };

    processImage(input, fromRgb, Number(similarity));
  };

  return (
    <Box>
      <ToolInputAndResult
        input={
          <ToolFileInput
            value={input}
            onChange={setInput}
            accept={['image/png']}
            title={'Input PNG'}
          />
        }
        result={
          <ToolFileResult
            title={'Transparent PNG'}
            value={result}
            extension={'png'}
          />
        }
      />
      <ToolOptions
        compute={compute}
        getGroups={({ values, updateField }) => [
          {
            title: 'From color and similarity',
            component: (
              <Box>
                <ColorSelector
                  value={values.fromColor}
                  onColorChange={(val) => updateField('fromColor', val)}
                  description={'Replace this color (from color)'}
                  inputProps={{ 'data-testid': 'color-input' }}
                />
                <TextFieldWithDesc
                  value={values.similarity}
                  onOwnChange={(val) => updateField('similarity', val)}
                  description={
                    'Match this % of similar colors of the from color. For example, 10% white will match white and a little bit of gray.'
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
