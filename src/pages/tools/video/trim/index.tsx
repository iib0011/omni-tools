import { Box } from '@mui/material';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { updateNumberField } from '@utils/string';
import { trimVideo } from './service';
import { InitialValuesType } from './types';
import { debounce } from 'lodash';
import ToolVideoInput from '@components/input/ToolVideoInput';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  start: 0,
  end: 100
};

const validationSchema = Yup.object({
  start: Yup.number().min(0, 'Start time must be positive'),
  end: Yup.number().min(
    Yup.ref('start'),
    'End time must be greater than start time'
  )
});

export default function TrimVideo({ title }: ToolComponentProps) {
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
      const resultFile = await trimVideo(input, optionsValues);
      setResult(resultFile);
    } catch (error) {
      console.error('Error trimming video:', error);
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
      title: t('trim.timestamps'),
      component: (
        <Box>
          <TextFieldWithDesc
            onOwnChange={(value) =>
              updateNumberField(value, 'start', updateField)
            }
            value={Number(values.start)}
            label={t('trim.startTime')}
            sx={{ mb: 2, backgroundColor: 'background.paper' }}
          />
          <TextFieldWithDesc
            onOwnChange={(value) =>
              updateNumberField(value, 'end', updateField)
            }
            value={Number(values.end)}
            label={t('trim.endTime')}
          />
        </Box>
      )
    }
  ];
  return (
    <ToolContent
      title={title}
      input={input}
      renderCustomInput={({ start, end }, setFieldValue) => {
        return (
          <ToolVideoInput
            value={input}
            onChange={setInput}
            title={t('trim.inputTitle')}
            showTrimControls={true}
            onTrimChange={(start, end) => {
              setFieldValue('start', start);
              setFieldValue('end', end);
            }}
            trimStart={Number(start)}
            trimEnd={Number(end)}
          />
        );
      }}
      resultComponent={
        <ToolFileResult
          title={t('trim.resultTitle')}
          value={result}
          loading={loading}
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
