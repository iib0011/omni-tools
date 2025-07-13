import { Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import ToolAudioInput from '@components/input/ToolAudioInput';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import RadioWithTextField from '@components/options/RadioWithTextField';
import { changeAudioSpeed } from './service';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  newSpeed: 2,
  outputFormat: 'mp3'
};

const formatOptions = [
  { label: 'MP3', value: 'mp3' },
  { label: 'AAC', value: 'aac' },
  { label: 'WAV', value: 'wav' }
];

export default function ChangeSpeed({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (
    optionsValues: InitialValuesType,
    input: File | null
  ) => {
    setLoading(true);
    try {
      const newFile = await changeAudioSpeed(input, optionsValues);
      setResult(newFile);
    } catch (err) {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('audio:changeSpeed.newAudioSpeed'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.newSpeed.toString()}
            onOwnChange={(val) => updateField('newSpeed', Number(val))}
            description={t('audio:changeSpeed.speedDescription')}
            type="number"
          />
        </Box>
      )
    },
    {
      title: t('audio:changeSpeed.outputFormat'),
      component: (
        <Box mt={2}>
          <RadioGroup
            row
            value={values.outputFormat}
            onChange={(e) =>
              updateField(
                'outputFormat',
                e.target.value as 'mp3' | 'aac' | 'wav'
              )
            }
          >
            {formatOptions.map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio />}
                label={opt.label}
              />
            ))}
          </RadioGroup>
        </Box>
      )
    }
  ];
  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolAudioInput
          value={input}
          onChange={setInput}
          title={t('audio:changeSpeed.inputTitle')}
        />
      }
      resultComponent={
        loading ? (
          <ToolFileResult
            title={t('audio:changeSpeed.settingSpeed')}
            value={null}
            loading={true}
          />
        ) : (
          <ToolFileResult
            title={t('audio:changeSpeed.resultTitle')}
            value={result}
            extension={result ? result.name.split('.').pop() : undefined}
          />
        )
      }
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('audio:changeSpeed.toolInfo.title', { title }),
        description: longDescription
      }}
    />
  );
}
