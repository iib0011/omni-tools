import { Box } from '@mui/material';
import React, { useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import ColorSelector from '@components/options/ColorSelector';
import Color from 'color';
import TextFieldWithDesc from 'components/options/TextFieldWithDesc';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolImageInput from '@components/input/ToolImageInput';
import { processImage } from './service';

const initialValues = {
  fromColor: 'white',
  toColor: 'black',
  similarity: '10'
};
const validationSchema = Yup.object({
  // splitSeparator: Yup.string().required('The separator is required')
});
export default function ChangeColorsInImage({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const compute = (optionsValues: typeof initialValues, input: any) => {
    if (!input) return;
    const { fromColor, toColor, similarity } = optionsValues;
    let fromRgb: [number, number, number];
    let toRgb: [number, number, number];
    try {
      //@ts-ignore
      fromRgb = Color(fromColor).rgb().array();
      //@ts-ignore
      toRgb = Color(toColor).rgb().array();
    } catch (err) {
      return;
    }

    processImage(input, fromRgb, toRgb, Number(similarity), setResult);
  };

  const getGroups: GetGroupsType<typeof initialValues> = ({
    values,
    updateField
  }) => [
    {
      title: 'From color and to color',
      component: (
        <Box>
          <ColorSelector
            value={values.fromColor}
            onColorChange={(val) => updateField('fromColor', val)}
            description={'Replace this color (from color)'}
            inputProps={{ 'data-testid': 'from-color-input' }}
          />
          <ColorSelector
            value={values.toColor}
            onColorChange={(val) => updateField('toColor', val)}
            description={'With this color (to color)'}
            inputProps={{ 'data-testid': 'to-color-input' }}
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
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/*']}
          title={'Input image'}
        />
      }
      resultComponent={<ToolFileResult title={'Result image'} value={result} />}
    />
  );
}
