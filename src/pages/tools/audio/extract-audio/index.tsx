import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { extractAudioFromVideo } from './service';
import { InitialValuesType } from './types';
import ToolVideoInput from '@components/input/ToolVideoInput';
import { GetGroupsType } from '@components/options/ToolOptions';
import ToolFileResult from '@components/result/ToolFileResult';
import SelectWithDesc from '@components/options/SelectWithDesc';

const initialValues: InitialValuesType = {
  outputFormat: 'aac'
};

export default function ExtractAudio({
  title,
  longDescription
}: ToolComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => {
    return [
      {
        title: 'Output Format',
        component: (
          <Box>
            <SelectWithDesc
              selected={values.outputFormat}
              onChange={(value) => {
                updateField('outputFormat', value.toString());
              }}
              options={[
                { label: 'AAC', value: 'aac' },
                { label: 'MP3', value: 'mp3' },
                { label: 'WAV', value: 'wav' }
              ]}
              description={
                'Select the format for the audio to be extracted as.'
              }
            />
          </Box>
        )
      }
    ];
  };

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) return;
    try {
      setLoading(true);
      const audioFileObj = await extractAudioFromVideo(input, values);
      setAudioFile(audioFileObj);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolContent
      title={title}
      input={file}
      inputComponent={
        <ToolVideoInput value={file} onChange={setFile} title={'Input Video'} />
      }
      resultComponent={
        loading ? (
          <ToolFileResult
            title={'Extracting Audio'}
            value={null}
            loading={true}
          />
        ) : (
          <ToolFileResult title={'Extracted Audio'} value={audioFile} />
        )
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      toolInfo={{ title: `What is ${title}?`, description: longDescription }}
      setInput={setFile}
    />
  );
}
