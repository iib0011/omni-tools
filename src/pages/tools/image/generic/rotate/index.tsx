import { ToolComponentProps } from '@tools/defineTool';
import { InitialValuesType } from './type';
import * as Yup from 'yup';

import { useState } from 'react';
import { GetGroupsType } from '@components/options/ToolOptions';
import SimpleRadio from '@components/options/SimpleRadio';
import { Box } from '@mui/material';
import SelectWithDesc from '@components/options/SelectWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolContent from '@components/ToolContent';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { processImage } from './service';

const initialValues: InitialValuesType = {
  rotateAngle: '0',
  rotateMethod: 'Preset'
};

const validationSchema = Yup.object({
  rotateAngle: Yup.number().when('rotateMethod', {
    is: 'degrees',
    then: (schema) =>
      schema
        .min(-360, 'Rotate angle must be at least -360')
        .max(360, 'Rotate angle must be at most 360')
        .required('Rotate angle is required')
  })
});

export default function RotateImage({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const compute = async (optionsValues: InitialValuesType, input: any) => {
    if (!input) return;
    setResult(await processImage(input, optionsValues));
  };
  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Rotate Method',
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('rotateMethod', 'Preset')}
            checked={values.rotateMethod === 'Preset'}
            description={'Rotate by a specific angle in degrees.'}
            title={'Preset angle'}
          />
          <SimpleRadio
            onClick={() => updateField('rotateMethod', 'Custom')}
            checked={values.rotateMethod === 'Custom'}
            description={'Rotate by a custom angle in degrees.'}
            title={'Custom angle'}
          />
        </Box>
      )
    },
    ...(values.rotateMethod === 'Preset'
      ? [
          {
            title: 'Preset angle',
            component: (
              <Box>
                <SelectWithDesc
                  selected={values.rotateAngle}
                  onChange={(val) => updateField('rotateAngle', val)}
                  description={'Rotate by a specific angle in degrees.'}
                  options={[
                    { label: '90 degrees', value: '90' },
                    { label: '180 degrees', value: '180' },
                    { label: '270 degrees', value: '270' },
                    { label: 'Flip horizontally', value: 'flip-x' },
                    { label: 'Flip vertically', value: 'flip-y' }
                  ]}
                />
              </Box>
            )
          }
        ]
      : [
          {
            title: 'Custom angle',
            component: (
              <Box>
                <TextFieldWithDesc
                  value={values.rotateAngle}
                  onOwnChange={(val) => updateField('rotateAngle', val)}
                  description={
                    'Rotate by a custom angle in degrees(from -360 to 360).'
                  }
                  inputProps={{
                    type: 'number',
                    min: -360,
                    max: 360
                  }}
                />
              </Box>
            )
          }
        ])
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
          title={'Input Image'}
          accept={['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif']}
        />
      }
      resultComponent={
        <ToolFileResult
          value={result}
          title={'Rotated Image'}
          extension={input?.name.split('.').pop() || 'png'}
        />
      }
      toolInfo={{
        title: 'Rotate Image',
        description:
          'This tool allows you to rotate images by a specific angle in any degrees.'
      }}
    />
  );
}
