import { ToolComponentProps } from '@tools/defineTool';
import { InitialValuesType } from './type';
import * as Yup from 'yup';
import { getFileExtension } from '@utils/file';
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
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  rotateAngle: '90',
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
  const { t } = useTranslation('image');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (optionsValues: InitialValuesType, input: any) => {
    if (!input) return;
    setLoading(true);
    try {
      const rotatedFile = await processImage(input, optionsValues);
      setResult(rotatedFile);
    } catch (err) {
      console.error(`Failed to rotate image input: ${err}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };
  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('rotate.options.method'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('rotateMethod', 'Preset')}
            checked={values.rotateMethod === 'Preset'}
            description={t('rotate.options.presetDesc')}
            title={t('rotate.options.presetTitle')}
          />
          <SimpleRadio
            onClick={() => updateField('rotateMethod', 'Custom')}
            checked={values.rotateMethod === 'Custom'}
            description={t('rotate.options.customDesc')}
            title={t('rotate.options.customTitle')}
          />
        </Box>
      )
    },
    ...(values.rotateMethod === 'Preset'
      ? [
          {
            title: t('rotate.options.angle'),
            component: (
              <Box>
                <SelectWithDesc
                  selected={values.rotateAngle}
                  onChange={(val) => updateField('rotateAngle', val)}
                  description={''}
                  options={[
                    { label: '90 degrees', value: '90' },
                    { label: '180 degrees', value: '180' },
                    { label: '270 degrees', value: '270' }
                  ]}
                />
              </Box>
            )
          }
        ]
      : [
          {
            title: t('rotate.options.angle'),
            component: (
              <Box>
                <TextFieldWithDesc
                  value={values.rotateAngle}
                  onOwnChange={(val) => updateField('rotateAngle', val)}
                  description={'- 360 ↔ 360'}
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
          title={t('rotate.inputTitle')}
          accept={['image/*']}
        />
      }
      resultComponent={
        <ToolFileResult
          value={result}
          title={t('rotate.resultTitle')}
          loading={loading}
          extension={result ? getFileExtension(result.name) : undefined}
        />
      }
    />
  );
}
