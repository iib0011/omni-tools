import { Box } from '@mui/material';
import React, { useState } from 'react';
import * as Yup from 'yup';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import SimpleRadio from '@components/options/SimpleRadio';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { processImage } from './service';
import { InitialValuesType } from './types';

const initialValues: InitialValuesType = {
  resizeMethod: 'pixels' as 'pixels' | 'percentage',
  dimensionType: 'width' as 'width' | 'height',
  width: '800',
  height: '600',
  percentage: '50',
  maintainAspectRatio: true
};

const validationSchema = Yup.object({
  width: Yup.number().when('resizeMethod', {
    is: 'pixels',
    then: (schema) =>
      schema.min(1, 'Width must be at least 1px').required('Width is required')
  }),
  height: Yup.number().when('resizeMethod', {
    is: 'pixels',
    then: (schema) =>
      schema
        .min(1, 'Height must be at least 1px')
        .required('Height is required')
  }),
  percentage: Yup.number().when('resizeMethod', {
    is: 'percentage',
    then: (schema) =>
      schema
        .min(1, 'Percentage must be at least 1%')
        .max(1000, 'Percentage must be at most 1000%')
        .required('Percentage is required')
  })
});

export default function ResizeImage({
  title,
  longDescription
}: ToolComponentProps) {
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
      title: 'Resize Method',
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('resizeMethod', 'pixels')}
            checked={values.resizeMethod === 'pixels'}
            description={'Resize by specifying dimensions in pixels.'}
            title={'Resize by Pixels'}
          />
          <SimpleRadio
            onClick={() => updateField('resizeMethod', 'percentage')}
            checked={values.resizeMethod === 'percentage'}
            description={
              'Resize by specifying a percentage of the original size.'
            }
            title={'Resize by Percentage'}
          />
        </Box>
      )
    },
    ...(values.resizeMethod === 'pixels'
      ? [
          {
            title: 'Dimension Type',
            component: (
              <Box>
                <CheckboxWithDesc
                  checked={values.maintainAspectRatio}
                  onChange={(value) =>
                    updateField('maintainAspectRatio', value)
                  }
                  description={
                    'Maintain the original aspect ratio of the image.'
                  }
                  title={'Maintain Aspect Ratio'}
                />
                {values.maintainAspectRatio && (
                  <Box>
                    <SimpleRadio
                      onClick={() => updateField('dimensionType', 'width')}
                      checked={values.dimensionType === 'width'}
                      description={
                        'Specify the width in pixels and calculate height based on aspect ratio.'
                      }
                      title={'Set Width'}
                    />
                    <SimpleRadio
                      onClick={() => updateField('dimensionType', 'height')}
                      checked={values.dimensionType === 'height'}
                      description={
                        'Specify the height in pixels and calculate width based on aspect ratio.'
                      }
                      title={'Set Height'}
                    />
                  </Box>
                )}
                <TextFieldWithDesc
                  value={values.width}
                  onOwnChange={(val) => updateField('width', val)}
                  description={'Width (in pixels)'}
                  disabled={
                    values.maintainAspectRatio &&
                    values.dimensionType === 'height'
                  }
                  inputProps={{
                    'data-testid': 'width-input',
                    type: 'number',
                    min: 1
                  }}
                />
                <TextFieldWithDesc
                  value={values.height}
                  onOwnChange={(val) => updateField('height', val)}
                  description={'Height (in pixels)'}
                  disabled={
                    values.maintainAspectRatio &&
                    values.dimensionType === 'width'
                  }
                  inputProps={{
                    'data-testid': 'height-input',
                    type: 'number',
                    min: 1
                  }}
                />
              </Box>
            )
          }
        ]
      : [
          {
            title: 'Percentage',
            component: (
              <Box>
                <TextFieldWithDesc
                  value={values.percentage}
                  onOwnChange={(val) => updateField('percentage', val)}
                  description={
                    'Percentage of original size (e.g., 50 for half size, 200 for double size)'
                  }
                  inputProps={{
                    'data-testid': 'percentage-input',
                    type: 'number',
                    min: 1,
                    max: 1000
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
          accept={['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif']}
          title={'Input Image'}
        />
      }
      resultComponent={
        <ToolFileResult
          title={'Resized Image'}
          value={result}
          extension={input?.name.split('.').pop() || 'png'}
        />
      }
      toolInfo={{ title: title, description: longDescription }}
    />
  );
}
