import { Box } from '@mui/material';
import React, { useState } from 'react';
import * as Yup from 'yup';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { updateNumberField } from '@utils/string';
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
  start: 0,
  end: 100
};

const validationSchema = Yup.object({
  start: Yup.number().min(0, 'Start time must be positive'),
  end: Yup.number().min(
    Yup.ref('start'),
    'End time must be greater than start time'
  )
});

export default function VideoToGif({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = (values: InitialValuesType, input: File | null) => {
    if (!input) return;
    const { fps, scale, start, end } = values;
    let ffmpeg: FFmpeg | null = null;
    let ffmpegLoaded = false;

    const convertVideoToGif = async (
      file: File,
      fps: string,
      scale: string,
      start: number,
      end: number
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
          '-ss',
          start.toString(),
          '-to',
          end.toString(),
          '-vf',
          `fps=${fps},scale=${scale},palettegen`,
          'palette.png'
        ]);

        await ffmpeg.exec([
          '-i',
          fileName,
          '-i',
          'palette.png',
          '-ss',
          start.toString(),
          '-to',
          end.toString(),
          '-filter_complex',
          `fps=${fps},scale=${scale}[x];[x][1:v]paletteuse`,
          outputName
        ]);

        const data = await ffmpeg.readFile(outputName);

        const blob = new Blob([data as any], { type: 'image/gif' });
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

    convertVideoToGif(input, fps, scale, start, end);
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
    },
    {
      title: 'Timestamps',
      component: (
        <Box>
          <TextFieldWithDesc
            onOwnChange={(value) =>
              updateNumberField(value, 'start', updateField)
            }
            value={values.start}
            label="Start Time"
            sx={{ mb: 2, backgroundColor: 'background.paper' }}
          />
          <TextFieldWithDesc
            onOwnChange={(value) =>
              updateNumberField(value, 'end', updateField)
            }
            value={values.end}
            label="End Time"
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      renderCustomInput={({ start, end }, setFieldValue) => {
        return (
          <ToolVideoInput
            value={input}
            onChange={setInput}
            title={'Input Video'}
            showTrimControls={true}
            onTrimChange={(start, end) => {
              setFieldValue('start', start);
              setFieldValue('end', end);
            }}
            trimStart={start}
            trimEnd={end}
          />
        );
      }}
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
