import { Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import ToolAudioInput from '@components/input/ToolAudioInput';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import RadioWithTextField from '@components/options/RadioWithTextField';

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
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // FFmpeg only supports a tempo between 0.5 and 2.0, so we chain filters
  const computeAudioFilter = (speed: number): string => {
    if (speed <= 2 && speed >= 0.5) {
      return `atempo=${speed}`;
    }
    const filters: string[] = [];
    let remainingSpeed = speed;
    while (remainingSpeed > 2.0) {
      filters.push('atempo=2.0');
      remainingSpeed /= 2.0;
    }
    while (remainingSpeed < 0.5) {
      filters.push('atempo=0.5');
      remainingSpeed /= 0.5;
    }
    filters.push(`atempo=${remainingSpeed.toFixed(2)}`);
    return filters.join(',');
  };

  const compute = async (
    optionsValues: InitialValuesType,
    input: File | null
  ) => {
    if (!input) return;
    const { newSpeed, outputFormat } = optionsValues;
    let ffmpeg: FFmpeg | null = null;
    let ffmpegLoaded = false;
    setLoading(true);
    try {
      ffmpeg = new FFmpeg();
      if (!ffmpegLoaded) {
        await ffmpeg.load({
          wasmURL:
            'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
        });
        ffmpegLoaded = true;
      }
      const fileName = input.name;
      const outputName = `output.${outputFormat}`;
      await ffmpeg.writeFile(fileName, await fetchFile(input));
      const audioFilter = computeAudioFilter(newSpeed);
      let args = ['-i', fileName, '-filter:a', audioFilter];
      if (outputFormat === 'mp3') {
        args.push('-b:a', '192k', '-f', 'mp3', outputName);
      } else if (outputFormat === 'aac') {
        args.push('-c:a', 'aac', '-b:a', '192k', '-f', 'adts', outputName);
      } else if (outputFormat === 'wav') {
        args.push(
          '-acodec',
          'pcm_s16le',
          '-ar',
          '44100',
          '-ac',
          '2',
          '-f',
          'wav',
          outputName
        );
      }
      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile(outputName);
      let mimeType = 'audio/mp3';
      if (outputFormat === 'aac') mimeType = 'audio/aac';
      if (outputFormat === 'wav') mimeType = 'audio/wav';
      const blob = new Blob([data], { type: mimeType });
      const newFile = new File(
        [blob],
        fileName.replace(/\.[^/.]+$/, `-${newSpeed}x.${outputFormat}`),
        { type: mimeType }
      );
      await ffmpeg.deleteFile(fileName);
      await ffmpeg.deleteFile(outputName);
      setResult(newFile);
    } catch (err) {
      console.error(`Failed to process audio: ${err}`);
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
      title: 'New Audio Speed',
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.newSpeed.toString()}
            onOwnChange={(val) => updateField('newSpeed', Number(val))}
            description="Default multiplier: 2 means 2x faster"
            type="number"
          />
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
          <ToolFileResult title="Setting Speed" value={null} loading={true} />
        ) : (
          <ToolFileResult
            title="Edited Audio"
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
