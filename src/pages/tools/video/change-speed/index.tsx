/* eslint-disable prettier/prettier */
import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { main } from './service';
import { InitialValuesType } from './types';
import ToolVideoInput from '@components/input/ToolVideoInput';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const initialValues: InitialValuesType = {
  newSpeed: 2
};

export default function ChangeSpeed({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = (optionsValues: InitialValuesType, input: File | null) => {
    setLoading(true);
    if (!input) return;
    const { newSpeed } = optionsValues;
    let ffmpeg: FFmpeg | null = null;
    let ffmpegLoaded = false;

    const processVideo = async (
      file: File,
      newSpeed: number
    ): Promise<void> => {
      if (!ffmpeg) {
        ffmpeg = new FFmpeg();
      }

      if (!ffmpegLoaded) {
        await ffmpeg.load({
          wasmURL:
            'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
        });
        ffmpegLoaded = true;
      }

      // Write file to FFmpeg FS
      const fileName = file.name;
      const outputName = 'output.mp4';

      try {
        ffmpeg.writeFile(fileName, await fetchFile(file));

        const videoFilter = `setpts=${1 / newSpeed}*PTS`;
        const audioFilter = computeAudioFilter(newSpeed);

        // Run FFmpeg command
        await ffmpeg.exec([
          '-i',
          fileName,
          '-vf',
          videoFilter,
          '-filter:a',
          audioFilter,
          '-c:v',
          'libx264',
          '-crf',
          '18',
          '-preset',
          'slow',
          '-c:a',
          'aac',
          '-b:a',
          '192k',
          outputName
        ]);

        const data = await ffmpeg.readFile(outputName);

        // Create new file from processed data
        const blob = new Blob([data], { type: 'video/mp4' });
        const newFile = new File(
          [blob],
          file.name.replace('.mp4', `-${newSpeed}x.mp4`),
          { type: 'video/mp4' }
        );

        // Clean up to free memory
        await ffmpeg.deleteFile(fileName);
        await ffmpeg.deleteFile(outputName);

        setResult(newFile);
      } catch (err) {
        console.error(`Failed to process video: ${err}`);
        throw err;
      } finally {
        setLoading(false);
      }

      // FFmpeg only supports atempo between 0.5 and 2.0, so we chain filters
      function computeAudioFilter(speed: number): string {
        if (speed <= 2 && speed >= 0.5) {
          return `atempo=${speed}`;
        }

        // Break into supported chunks
        const filters = [];
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
      }
    };

    // Here we set the output video
    setResult(main(input, optionsValues));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: 'New Video Speed',
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
          title={'Input Video'}
        />
      }
      resultComponent={
        loading ? (
          <ToolFileResult
            title="Setting Speed"
            value={null}
            loading={true}
            extension={''}
          />
        ) : (
          <ToolFileResult title="Edited Video" value={result} extension="mp4" />
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
