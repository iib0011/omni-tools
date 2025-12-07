import { Box, Typography } from '@mui/material';
import React, { useCallback, useState, useEffect } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { debounce } from 'lodash';
import ToolVideoInput from '@components/input/ToolVideoInput';
import { useTranslation } from 'react-i18next';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { formatTime } from '@components/input/file-input-utils';

const ffmpeg = new FFmpeg();

const getInitialValues = (duration: number = 0) => ({
  trimStart: 0,
  trimEnd: duration || 0
});

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
  const [videoDuration, setVideoDuration] = useState(0);
  const [initialValuesState, setInitialValuesState] = useState(
    getInitialValues(0)
  );

  const compute = async (
    optionsValues: ReturnType<typeof getInitialValues>,
    input: File | null
  ) => {
    if (!input || videoDuration === 0) return;

    const { trimStart, trimEnd } = optionsValues;

    // Validate trim values
    if (trimStart < 0 || trimEnd <= trimStart || trimEnd > videoDuration) {
      return;
    }

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

  const debouncedCompute = useCallback(debounce(compute, 1000), [
    videoDuration
  ]);

  const handleVideoLoad = (duration: number) => {
    setVideoDuration(duration);
    if (duration > 0) {
      setInitialValuesState(getInitialValues(duration));
    }
  };

  const getGroups: GetGroupsType<ReturnType<typeof getInitialValues>> = ({
    values,
    updateField
  }) => {
    if (videoDuration === 0) {
      return [
        {
          title: t('trim.timestamps'),
          component: (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Please upload a video to enable trim controls
              </Typography>
            </Box>
          )
        }
      ];
    }

    return [
      {
        title: t('trim.timestamps'),
        component: (
          <Box sx={{ px: 2, py: 3 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Start Time
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatTime(values.trimStart)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  End Time
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatTime(values.trimEnd)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Duration
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatTime(values.trimEnd - values.trimStart)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ px: 1 }}>
              <Slider
                range
                min={0}
                max={videoDuration}
                step={0.1}
                value={[values.trimStart, values.trimEnd]}
                onChange={(values) => {
                  if (Array.isArray(values)) {
                    updateField('trimStart', values[0]);
                    updateField('trimEnd', values[1]);
                  }
                }}
                allowCross={false}
                pushable={0.1}
                trackStyle={[
                  { backgroundColor: '#1976d2', height: 6 },
                  { backgroundColor: '#1976d2', height: 6 }
                ]}
                handleStyle={[
                  {
                    borderColor: '#1976d2',
                    height: 20,
                    width: 20,
                    marginLeft: -10,
                    marginTop: -7,
                    backgroundColor: '#1976d2'
                  },
                  {
                    borderColor: '#1976d2',
                    height: 20,
                    width: 20,
                    marginLeft: -10,
                    marginTop: -7,
                    backgroundColor: '#1976d2'
                  }
                ]}
                railStyle={{ backgroundColor: '#e0e0e0', height: 6 }}
              />
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 1
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {formatTime(0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTime(videoDuration)}
              </Typography>
            </Box>
          </Box>
        )
      }
    ];
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolVideoInput
          value={input}
          onChange={setInput}
          title={t('trim.inputTitle')}
          showTrimControls={false}
          onVideoDurationChange={handleVideoLoad}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('trim.resultTitle')}
          value={result}
          extension={'mp4'}
        />
      }
      initialValues={initialValuesState}
      getGroups={getGroups}
      compute={debouncedCompute}
      setInput={setInput}
      validationSchema={validationSchema}
    />
  );
}
