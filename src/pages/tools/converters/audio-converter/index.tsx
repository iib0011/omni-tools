import React, { useState } from 'react';
import { Box } from '@mui/material';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolAudioInput from '@components/input/ToolAudioInput';
import ToolFileResult from '@components/result/ToolFileResult';
import SelectWithDesc from '@components/options/SelectWithDesc';
import { convertAudio } from './service';
import { useTranslation } from 'react-i18next';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType, AUDIO_FORMATS, AudioFormat } from './types';

const initialValues: InitialValuesType = {
  outputFormat: 'mp3'
};

export default function AudioConverter({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('audio');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (
    values: InitialValuesType,
    inputFile: File | null
  ): Promise<void> => {
    if (!inputFile) return;

    try {
      setLoading(true);
      const resultFile = await convertAudio(inputFile, values);
      setResult(resultFile);
    } catch (error) {
      console.error('Conversion failed:', error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Explicitly type getGroups to match GetGroupsType<InitialValuesType>
  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      id: 'output-format',
      title: t('audioConverter.outputFormat', 'Output Format'),
      description: t(
        'audioConverter.outputFormatDescription',
        'Select the desired output audio format'
      ),
      component: (
        <Box>
          <SelectWithDesc
            selected={values.outputFormat}
            onChange={(value) => updateField('outputFormat', value)}
            options={Object.entries(AUDIO_FORMATS).map(([value]) => ({
              label: value.toUpperCase(),
              value: value as AudioFormat
            }))}
            description={t(
              'audioConverter.outputFormatDescription',
              'Select the desired output audio format'
            )}
          />
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
          title={t('audioConverter.uploadAudio', 'Upload Your Audio File')}
        />
      }
      resultComponent={
        <ToolFileResult
          value={result}
          title={t('audioConverter.outputTitle', 'Converted Audio')}
          loading={loading}
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: `What is a ${title}?`,
        description: longDescription
      }}
    />
  );
}
