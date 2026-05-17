import { Box } from '@mui/material';
import React, { useRef, useState } from 'react';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from 'components/options/TextFieldWithDesc';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolMultipleImageInput, {
  MultiImageInput
} from '@components/input/ToolMultipleImageInput';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';
import { updateNumberField } from '@utils/string';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  frameDelay: 500
};

export default function ImagesToGif({ title }: ToolComponentProps) {
  const { t } = useTranslation('video');
  const [input, setInput] = useState<MultiImageInput[]>([]);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const ffmpegLoadedRef = useRef(false);
  const processingRef = useRef(false);

  const compute = (
    optionsValues: InitialValuesType,
    input: MultiImageInput[]
  ) => {
    if (!input || input.length === 0) return;
    if (processingRef.current) return;

    const { frameDelay } = optionsValues;

    const processImages = async (): Promise<void> => {
      processingRef.current = true;
      setLoading(true);
      setResult(null);

      if (!ffmpegRef.current) {
        ffmpegRef.current = new FFmpeg();
      }

      const ffmpeg = ffmpegRef.current;

      if (!ffmpegLoadedRef.current) {
        await ffmpeg.load({
          coreURL:
            'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.js',
          wasmURL:
            'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
        });
        ffmpegLoadedRef.current = true;
      }

      const fileNames: string[] = [];

      try {
        const durationSeconds = frameDelay / 1000;

        for (let i = 0; i < input.length; i++) {
          const file = input[i].file;
          const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const fname = `frame${i.toString().padStart(4, '0')}.${ext}`;
          fileNames.push(fname);
          await ffmpeg.writeFile(fname, await fetchFile(file));
        }

        const listContent =
          fileNames
            .map((f) => `file '${f}'\nduration ${durationSeconds}`)
            .join('\n') + `\nfile '${fileNames[fileNames.length - 1]}'`;
        await ffmpeg.writeFile('list.txt', listContent);

        await ffmpeg.exec([
          '-f',
          'concat',
          '-safe',
          '0',
          '-i',
          'list.txt',
          '-vf',
          'scale=480:-2:flags=lanczos',
          '-loop',
          '0',
          'output.gif'
        ]);

        const data = await ffmpeg.readFile('output.gif');
        const blob = new Blob([data as any], { type: 'image/gif' });
        setResult(new File([blob], 'animated.gif', { type: 'image/gif' }));
      } finally {
        for (const fname of fileNames) {
          try {
            await ffmpeg.deleteFile(fname);
          } catch {
            /* ignore */
          }
        }
        try {
          await ffmpeg.deleteFile('list.txt');
        } catch {
          /* ignore */
        }
        try {
          await ffmpeg.deleteFile('output.gif');
        } catch {
          /* ignore */
        }
        setLoading(false);
        processingRef.current = false;
      }
    };

    processImages();
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolMultipleImageInput
          value={input}
          onChange={setInput}
          type="image"
          accept={['image/*']}
          title={t('gif.imagesToGif.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('gif.imagesToGif.resultTitle')}
          value={result}
          extension="gif"
          loading={loading}
          loadingText={t('gif.imagesToGif.loadingText')}
        />
      }
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: t('gif.imagesToGif.frameOptions'),
          component: (
            <Box>
              <TextFieldWithDesc
                name="frameDelay"
                type="number"
                inputProps={{ min: 50, max: 10000, step: 50 }}
                description={t('gif.imagesToGif.frameDelayDescription')}
                onOwnChange={(value) =>
                  updateNumberField(value, 'frameDelay', updateField)
                }
                value={values.frameDelay}
              />
            </Box>
          )
        }
      ]}
      compute={compute}
      setInput={setInput}
    />
  );
}
