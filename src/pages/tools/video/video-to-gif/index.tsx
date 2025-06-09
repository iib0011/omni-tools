/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import ToolVideoInput from '@components/input/ToolVideoInput';
import ToolFileResult from '@components/result/ToolFileResult';
import SimpleRadio from '@components/options/SimpleRadio';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const initialValues: InitialValuesType = {
  quality: 'mid',
  fps: '10',
  scale: '320:-1:flags=bicubic',
  starting: '0',
  duration: ''
};

export default function VideoToGif({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = (values: InitialValuesType, input: File | null) => {
    if (!input) return;
    const { fps, scale, starting, duration } = values;
    let ffmpeg: FFmpeg | null = null;
    let ffmpegLoaded = false;

    const convertVideoToGif = async (
      file: File,
      fps: string,
      scale: string
    ): Promise<void> => {
      setLoading(true);

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

      const fileName = file.name;
      const outputName = 'output.gif';

      try {
        ffmpeg.writeFile(fileName, await fetchFile(file));

        await ffmpeg.exec([
          '-i',
          fileName,
          '-vf',
          `fps=${fps},scale=${scale},palettegen`,
          'palette.png'
        ]);

        await ffmpeg.exec([
          '-i',
          fileName,
          '-i',
          'palette.png',
          '-filter_complex',
          `fps=${fps},scale=${scale}[x];[x][1:v]paletteuse`,
          outputName
        ]);

        const data = await ffmpeg.readFile(outputName);

        const blob = new Blob([data], { type: 'image/gif' });
        const convertedFile = new File([blob], outputName, {
          type: 'image/gif'
        });

        await ffmpeg.deleteFile(fileName);
        await ffmpeg.deleteFile(outputName);

        setResult(convertedFile);
      } catch (err) {
        console.error(`Failed to convert video: ${err}`);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    convertVideoToGif(input, fps, scale);
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: 'Set Quality',
      component: (
        <Box>
          <SimpleRadio
            title="Low"
            onClick={() => {
              updateField('quality', 'low');
              updateField('fps', '5');
              updateField('scale', '240:-1:flags=bilinear');
            }}
            checked={values.quality === 'low'}
          />
          <SimpleRadio
            title="Mid"
            onClick={() => {
              updateField('quality', 'mid');
              updateField('fps', '10');
              updateField('scale', '320:-1:flags=bicubic');
            }}
            checked={values.quality === 'mid'}
          />
          <SimpleRadio
            title="High"
            onClick={() => {
              updateField('quality', 'high');
              updateField('fps', '15');
              updateField('scale', '480:-1:flags=lanczos');
            }}
            checked={values.quality === 'high'}
          />
          <SimpleRadio
            title="Ultra"
            onClick={() => {
              updateField('quality', 'ultra');
              updateField('fps', '15');
              updateField('scale', '640:-1:flags=lanczos');
            }}
            checked={values.quality === 'ultra'}
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
        <ToolVideoInput value={input} onChange={setInput} title="Input Video" />
      }
      resultComponent={
        loading ? (
          <ToolFileResult
            title="Converting to Gif"
            value={null}
            loading={true}
          />
        ) : (
          <ToolFileResult
            title="Converted to Gif"
            value={result}
            extension="gif"
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
