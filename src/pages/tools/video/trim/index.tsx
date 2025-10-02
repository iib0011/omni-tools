import { Box } from '@mui/material';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { updateNumberField } from '@utils/string';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { debounce } from 'lodash';
import ToolVideoInput from '@components/input/ToolVideoInput';
import { useTranslation } from 'react-i18next';

const ffmpeg = new FFmpeg();

const initialValues = {
  trimStart: 0,
  trimEnd: 100
};

const validationSchema = Yup.object({
  trimStart: Yup.number().min(0, 'Start time must be positive'),
  trimEnd: Yup.number().min(
    Yup.ref('trimStart'),
    'End time must be greater than start time'
  )
});

export default function TrimVideo({ title }: ToolComponentProps) {
  const { t } = useTranslation('video');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const compute = async (
    optionsValues: typeof initialValues,
    input: File | null
  ) => {
    if (!input) return;

    const { trimStart, trimEnd } = optionsValues;

    try {
      if (!ffmpeg.loaded) {
        await ffmpeg.load({
          wasmURL:
            'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
        });
      }

      const inputName = 'input.mp4';
      const outputName = 'output.mp4';
      // Load file into FFmpeg's virtual filesystem
      await ffmpeg.writeFile(inputName, await fetchFile(input));
      // Run FFmpeg command to trim video
      await ffmpeg.exec([
        '-i',
        inputName,
        '-ss',
        trimStart.toString(),
        '-to',
        trimEnd.toString(),
        '-c',
        'copy',
        outputName
      ]);
      // Retrieve the processed file
      const trimmedData = await ffmpeg.readFile(outputName);
      const trimmedBlob = new Blob([trimmedData as any], { type: 'video/mp4' });
      const trimmedFile = new File(
        [trimmedBlob],
        `${input.name.replace(/\.[^/.]+$/, '')}_trimmed.mp4`,
        {
          type: 'video/mp4'
        }
      );

      setResult(trimmedFile);
    } catch (error) {
      console.error('Error trimming video:', error);
    }
  };
  const debouncedCompute = useCallback(debounce(compute, 1000), []);
  const getGroups: GetGroupsType<typeof initialValues> = ({
    values,
    updateField
  }) => [
    {
      title: t('trim.timestamps'),
      component: (
        <Box>
          <TextFieldWithDesc
            onOwnChange={(value) =>
              updateNumberField(value, 'trimStart', updateField)
            }
            value={values.trimStart}
            label={t('trim.startTime')}
            sx={{ mb: 2, backgroundColor: 'background.paper' }}
          />
          <TextFieldWithDesc
            onOwnChange={(value) =>
              updateNumberField(value, 'trimEnd', updateField)
            }
            value={values.trimEnd}
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
      renderCustomInput={({ trimStart, trimEnd }, setFieldValue) => {
        return (
          <ToolVideoInput
            value={input}
            onChange={setInput}
            title={t('trim.inputTitle')}
            showTrimControls={true}
            onTrimChange={(trimStart, trimEnd) => {
              setFieldValue('trimStart', trimStart);
              setFieldValue('trimEnd', trimEnd);
            }}
            trimStart={trimStart}
            trimEnd={trimEnd}
          />
        );
      }}
      resultComponent={
        <ToolFileResult
          title={t('trim.resultTitle')}
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
