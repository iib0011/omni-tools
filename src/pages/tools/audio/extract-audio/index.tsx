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
import { useTranslation } from 'react-i18next';
import { getFileExtension } from '@utils/file';

const initialValues: InitialValuesType = {
  outputFormat: 'aac'
};

export default function ExtractAudio({ title }: ToolComponentProps) {
  const { t } = useTranslation('audio');
  const [file, setFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => {
    return [
      {
        title: t('extractAudio.outputFormat'),
        component: (
          <Box>
            <SelectWithDesc
              selected={values.outputFormat}
              onChange={(value) => {
                updateField('outputFormat', value);
              }}
              options={[
                { label: 'AAC', value: 'aac' },
                { label: 'MP3', value: 'mp3' },
                { label: 'WAV', value: 'wav' }
              ]}
              description={t('extractAudio.outputFormatDescription')}
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
        <ToolVideoInput
          value={file}
          onChange={setFile}
          title={t('extractAudio.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('extractAudio.resultTitle')}
          loading={loading}
          value={audioFile}
          extension={audioFile ? getFileExtension(audioFile.name) : undefined}
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      toolInfo={{
        title: t('extractAudio.toolInfo.title', { title }),
        description: t('extractAudio.toolInfo.description')
      }}
      setInput={setFile}
    />
  );
}
