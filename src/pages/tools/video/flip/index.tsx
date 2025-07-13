import { Box } from '@mui/material';
import { useCallback, useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { debounce } from 'lodash';
import ToolVideoInput from '@components/input/ToolVideoInput';
import { flipVideo } from './service';
import { FlipOrientation, InitialValuesType } from './types';
import SimpleRadio from '@components/options/SimpleRadio';
import { useTranslation } from 'react-i18next';

export const initialValues: InitialValuesType = {
  orientation: 'horizontal'
};

export const validationSchema = Yup.object({
  orientation: Yup.string()
    .oneOf(
      ['horizontal', 'vertical'],
      'Orientation must be horizontal or vertical'
    )
    .required('Orientation is required')
});

const orientationOptions: { value: FlipOrientation; label: string }[] = [
  { value: 'horizontal', label: 'Horizontal (Mirror)' },
  { value: 'vertical', label: 'Vertical (Upside Down)' }
];

export default function FlipVideo({ title }: ToolComponentProps) {
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
      const flippedFile = await flipVideo(input, optionsValues.orientation);
      setResult(flippedFile);
    } catch (error) {
      console.error('Error flipping video:', error);
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
      title: t('flip.orientation'),
      component: (
        <Box>
          {orientationOptions.map((orientationOption) => (
            <SimpleRadio
              key={orientationOption.value}
              title={t(`flip.${orientationOption.value}Label`)}
              checked={values.orientation === orientationOption.value}
              onClick={() => {
                updateField('orientation', orientationOption.value);
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
          title={t('flip.inputTitle')}
        />
      }
      resultComponent={
        loading ? (
          <ToolFileResult
            title={t('flip.flippingVideo')}
            value={null}
            loading={true}
            extension={''}
          />
        ) : (
          <ToolFileResult
            title={t('flip.resultTitle')}
            value={result}
            extension={'mp4'}
          />
        )
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={debouncedCompute}
      setInput={setInput}
      validationSchema={validationSchema}
    />
  );
}
