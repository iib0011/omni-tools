import { Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import ToolMultipleAudioInput, {
  MultiAudioInput
} from '@components/input/ToolMultipleAudioInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { mergeAudioFiles } from './service';

const initialValues: InitialValuesType = {
  outputFormat: 'mp3'
};

const formatOptions = [
  { label: 'MP3', value: 'mp3' },
  { label: 'AAC', value: 'aac' },
  { label: 'WAV', value: 'wav' }
];

export default function MergeAudio({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<MultiAudioInput[]>([]);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (
    optionsValues: InitialValuesType,
    input: MultiAudioInput[]
  ) => {
    if (input.length === 0) return;
    setLoading(true);
    try {
      const files = input.map((item) => item.file);
      const mergedFile = await mergeAudioFiles(files, optionsValues);
      setResult(mergedFile);
    } catch (err) {
      console.error(`Failed to merge audio: ${err}`);
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
        <ToolMultipleAudioInput
          value={input}
          onChange={setInput}
          accept={['audio/*', '.mp3', '.wav', '.aac']}
          title={'Input Audio Files'}
          type="audio"
        />
      }
      resultComponent={
        loading ? (
          <ToolFileResult title="Merging Audio" value={null} loading={true} />
        ) : (
          <ToolFileResult
            title="Merged Audio"
            value={result}
            extension={result ? result.name.split('.').pop() : undefined}
          />
        )
      }
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is ${title}?`, description: longDescription }}
    />
  );
}
