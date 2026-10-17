import { Box } from '@mui/material';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { debounce } from 'lodash';
import ToolVideoInput from '@components/input/ToolVideoInput';
import { rotateVideo } from './service';
import SimpleRadio from '@components/options/SimpleRadio';
import { useTranslation } from 'react-i18next';
import { InitialValuesType, RotationAngle } from './types';

export const initialValues: InitialValuesType = {
  rotation: 90
};

export const validationSchema = Yup.object({
  rotation: Yup.number()
    .oneOf([90, 180, 270], 'Rotation must be 90, 180, or 270 degrees')
    .required('Rotation is required')
});

const angleOptions: { value: RotationAngle; label: string }[] = [
  { value: 90, label: '90° Clockwise' },
  { value: 180, label: '180° (Upside down)' },
  { value: 270, label: '270° (90° Counter-clockwise)' }
];
export default function RotateVideo({ title }: ToolComponentProps) {
  const { t } = useTranslation('video');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (
    optionsValues: InitialValuesType,
    input: File | null
  ) => {
    if (!input) return;
    setLoading(true);

    try {
      const rotatedFile = await rotateVideo(input, optionsValues);
      setResult(rotatedFile);
    } catch (error) {
      console.error('Error rotating video:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedCompute = useCallback(debounce(compute, 1000), []);

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('rotate.rotation'),
      component: (
        <Box>
          {angleOptions.map((angleOption) => (
            <SimpleRadio
              key={angleOption.value}
              title={t(`rotate.${angleOption.value}Degrees`)}
              checked={values.rotation === angleOption.value}
              onClick={() => {
                updateField('rotation', angleOption.value);
              }}
            />
          ))}
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolVideoInput
          value={input}
          onChange={setInput}
          title={t('rotate.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('rotate.resultTitle')}
          loading={loading}
          value={result}
          extension={'mp4'}
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={debouncedCompute}
      setInput={setInput}
      validationSchema={validationSchema}
    />
  );
}
