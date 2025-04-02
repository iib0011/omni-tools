import React, { useState } from 'react';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { changeOpacity } from './service';
import ToolContent from '@components/ToolContent';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { updateNumberField } from '@utils/string';
import { Box } from '@mui/material';
import SimpleRadio from '@components/options/SimpleRadio';

type InitialValuesType = {
  opacity: number;
  mode: 'solid' | 'gradient';
  gradientType: 'linear' | 'radial';
  gradientDirection: 'left-to-right' | 'inside-out';
  areaLeft: number;
  areaTop: number;
  areaWidth: number;
  areaHeight: number;
};

const initialValues: InitialValuesType = {
  opacity: 0.5,
  mode: 'solid',
  gradientType: 'linear',
  gradientDirection: 'left-to-right',
  areaLeft: 0,
  areaTop: 0,
  areaWidth: 100,
  areaHeight: 100
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Semi-transparent PNG',
    description: 'Make an image 50% transparent',
    sampleOptions: {
      opacity: 0.5,
      mode: 'solid',
      gradientType: 'linear',
      gradientDirection: 'left-to-right',
      areaLeft: 0,
      areaTop: 0,
      areaWidth: 100,
      areaHeight: 100
    },
    sampleResult: ''
  },
  {
    title: 'Slightly Faded PNG',
    description: 'Create a subtle transparency effect',
    sampleOptions: {
      opacity: 0.8,
      mode: 'solid',
      gradientType: 'linear',
      gradientDirection: 'left-to-right',
      areaLeft: 0,
      areaTop: 0,
      areaWidth: 100,
      areaHeight: 100
    },
    sampleResult: ''
  },
  {
    title: 'Radial Gradient Opacity',
    description: 'Apply a radial gradient opacity effect',
    sampleOptions: {
      opacity: 0.8,
      mode: 'gradient',
      gradientType: 'radial',
      gradientDirection: 'inside-out',
      areaLeft: 25,
      areaTop: 25,
      areaWidth: 50,
      areaHeight: 50
    },
    sampleResult: ''
  }
];

export default function ChangeOpacity({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const compute = (values: InitialValuesType, input: any) => {
    if (input) {
      changeOpacity(input, values).then(setResult);
    }
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
          title={'Input image'}
        />
      }
      resultComponent={
        <ToolFileResult title={'Changed image'} value={result} />
      }
      initialValues={initialValues}
      // exampleCards={exampleCards}
      getGroups={({ values, updateField }) => [
        {
          title: 'Opacity Settings',
          component: (
            <Box>
              <TextFieldWithDesc
                description="Set opacity between 0 (transparent) and 1 (opaque)"
                value={values.opacity}
                onOwnChange={(val) =>
                  updateNumberField(val, 'opacity', updateField)
                }
                type="number"
                inputProps={{ step: 0.1, min: 0, max: 1 }}
              />
              <SimpleRadio
                onClick={() => updateField('mode', 'solid')}
                checked={values.mode === 'solid'}
                description={'Set the same opacity level for all pixels'}
                title={'Apply Solid Opacity'}
              />
              <SimpleRadio
                onClick={() => updateField('mode', 'gradient')}
                checked={values.mode === 'gradient'}
                description={'Change opacity in a gradient'}
                title={'Apply Gradient Opacity'}
              />
            </Box>
          )
        },
        {
          title: 'Gradient Options',
          component: (
            <Box>
              <SimpleRadio
                onClick={() => updateField('gradientType', 'linear')}
                checked={values.gradientType === 'linear'}
                description={'Linear opacity direction'}
                title={'Linear Gradient'}
              />
              <SimpleRadio
                onClick={() => updateField('gradientType', 'radial')}
                checked={values.gradientType === 'radial'}
                description={'Radial opacity direction'}
                title={'Radial Gradient'}
              />
            </Box>
          )
        },
        {
          title: 'Opacity Area',
          component: (
            <Box>
              <TextFieldWithDesc
                description="Left position"
                value={values.areaLeft}
                onOwnChange={(val) =>
                  updateNumberField(val, 'areaLeft', updateField)
                }
                type="number"
              />
              <TextFieldWithDesc
                description="Top position"
                value={values.areaTop}
                onOwnChange={(val) =>
                  updateNumberField(val, 'areaTop', updateField)
                }
                type="number"
              />
              <TextFieldWithDesc
                description="Width"
                value={values.areaWidth}
                onOwnChange={(val) =>
                  updateNumberField(val, 'areaWidth', updateField)
                }
                type="number"
              />
              <TextFieldWithDesc
                description="Height"
                value={values.areaHeight}
                onOwnChange={(val) =>
                  updateNumberField(val, 'areaHeight', updateField)
                }
                type="number"
              />
            </Box>
          )
        }
      ]}
      compute={compute}
    />
  );
}
