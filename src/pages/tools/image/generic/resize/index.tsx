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
import { useTranslation } from 'react-i18next';

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

export default function ResizeImage({ title }: ToolComponentProps) {
  const { t } = useTranslation();
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
      title: t('image.resize.resizeMethod'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('resizeMethod', 'pixels')}
            checked={values.resizeMethod === 'pixels'}
            description={t('image.resize.resizeByPixelsDescription')}
            title={t('image.resize.resizeByPixels')}
          />
          <SimpleRadio
            onClick={() => updateField('resizeMethod', 'percentage')}
            checked={values.resizeMethod === 'percentage'}
            description={t('image.resize.resizeByPercentageDescription')}
            title={t('image.resize.resizeByPercentage')}
          />
        </Box>
      )
    },
    ...(values.resizeMethod === 'pixels'
      ? [
          {
            title: t('image.resize.dimensionType'),
            component: (
              <Box>
                <CheckboxWithDesc
                  checked={values.maintainAspectRatio}
                  onChange={(value) =>
                    updateField('maintainAspectRatio', value)
                  }
                  description={t('image.resize.maintainAspectRatioDescription')}
                  title={t('image.resize.maintainAspectRatio')}
                />
                {values.maintainAspectRatio && (
                  <Box>
                    <SimpleRadio
                      onClick={() => updateField('dimensionType', 'width')}
                      checked={values.dimensionType === 'width'}
                      description={t('image.resize.setWidthDescription')}
                      title={t('image.resize.setWidth')}
                    />
                    <SimpleRadio
                      onClick={() => updateField('dimensionType', 'height')}
                      checked={values.dimensionType === 'height'}
                      description={t('image.resize.setHeightDescription')}
                      title={t('image.resize.setHeight')}
                    />
                  </Box>
                )}
                <TextFieldWithDesc
                  value={values.width}
                  onOwnChange={(val) => updateField('width', val)}
                  description={t('image.resize.widthDescription')}
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
                  description={t('image.resize.heightDescription')}
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
            title: t('image.resize.percentage'),
            component: (
              <Box>
                <TextFieldWithDesc
                  value={values.percentage}
                  onOwnChange={(val) => updateField('percentage', val)}
                  description={t('image.resize.percentageDescription')}
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
          title={t('image.resize.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('image.resize.resultTitle')}
          value={result}
          extension={input?.name.split('.').pop() || 'png'}
        />
      }
      toolInfo={{
        title: t('image.resize.toolInfo.title'),
        description: t('image.resize.toolInfo.description')
      }}
    />
  );
}
