import { Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import ToolAudioInput from '@components/input/ToolAudioInput';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { trimAudio } from './service';

const initialValues: InitialValuesType = {
  startTime: '00:00:00',
  endTime: '00:01:00',
  outputFormat: 'mp3'
};

const formatOptions = [
  { label: 'MP3', value: 'mp3' },
  { label: 'AAC', value: 'aac' },
  { label: 'WAV', value: 'wav' }
];

export default function Trim({ title, longDescription }: ToolComponentProps) {
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
      const trimmedFile = await trimAudio(input, optionsValues);
      setResult(trimmedFile);
    } catch (err) {
      console.error(`Failed to trim audio: ${err}`);
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
      title: 'Time Settings',
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.startTime}
            onOwnChange={(val) => updateField('startTime', val)}
            description="Start time in format HH:MM:SS (e.g., 00:00:30)"
            label="Start Time"
          />
          <Box mt={2}>
            <TextFieldWithDesc
              value={values.endTime}
              onOwnChange={(val) => updateField('endTime', val)}
              description="End time in format HH:MM:SS (e.g., 00:01:30)"
              label="End Time"
            />
          </Box>
        </Box>
      )
    },
    {
      title: 'Output Format',
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
          title={'Input Audio'}
        />
      }
      resultComponent={
        loading ? (
          <ToolFileResult title="Trimming Audio" value={null} loading={true} />
        ) : (
          <ToolFileResult
            title="Trimmed Audio"
            value={result}
            extension={result ? result.name.split('.').pop() : undefined}
          />
        )
      }
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
