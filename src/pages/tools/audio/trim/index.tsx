import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import ToolAudioInput from '@components/input/ToolAudioInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { trimAudio } from './service';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { formatTime } from '@components/input/file-input-utils';

const formatOptions = [
  { label: 'MP3', value: 'mp3' },
  { label: 'AAC', value: 'aac' },
  { label: 'WAV', value: 'wav' }
];

// Convert HH:MM:SS to seconds
const timeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
};

// Convert seconds to HH:MM:SS
const secondsToTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const getInitialValues = (duration: number = 0): InitialValuesType => ({
  startTime: '00:00:00',
  endTime: secondsToTime(duration || 60),
  outputFormat: 'mp3'
});

export default function Trim({ title, longDescription }: ToolComponentProps) {
  const { t } = useTranslation('audio');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);

  const compute = async (
    optionsValues: InitialValuesType,
    input: File | null
  ) => {
    if (!input) return;
    setLoading(true);
    try {
      const trimmedFile = await trimAudio(input, optionsValues);
      setResult(trimmedFile);
    } catch (err) {
      console.error(`Failed to trim audio: ${err}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioLoad = (duration: number) => {
    setAudioDuration(duration);
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => {
    if (audioDuration === 0) {
      return [
        {
          title: t('trim.timeSettings'),
          component: (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Please upload an audio file to enable trim controls
              </Typography>
            </Box>
          )
        }
      ];
    }

    const startSeconds = timeToSeconds(values.startTime);
    const endSeconds = timeToSeconds(values.endTime);

    return [
      {
        title: t('trim.timeSettings'),
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
                  {values.startTime}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  End Time
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {values.endTime}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Duration
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatTime(endSeconds - startSeconds)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ px: 1 }}>
              <Slider
                range
                min={0}
                max={audioDuration}
                step={0.1}
                value={[startSeconds, endSeconds]}
                onChange={(values) => {
                  if (Array.isArray(values)) {
                    updateField('startTime', secondsToTime(values[0]));
                    updateField('endTime', secondsToTime(values[1]));
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
                {formatTime(audioDuration)}
              </Typography>
            </Box>
          </Box>
        )
      },
      {
        title: t('trim.outputFormat'),
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
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <AudioInputWithDuration
          value={input}
          onChange={setInput}
          title={t('trim.inputTitle')}
          onDurationChange={handleAudioLoad}
        />
      }
      resultComponent={
        loading ? (
          <ToolFileResult
            title={t('trim.trimmingAudio')}
            value={null}
            loading={true}
          />
        ) : (
          <ToolFileResult
            title={t('trim.resultTitle')}
            value={result}
            extension={result ? result.name.split('.').pop() : undefined}
          />
        )
      }
      initialValues={getInitialValues(audioDuration)}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('trim.toolInfo.title', { title }),
        description: longDescription
      }}
    />
  );
}

// Wrapper component to capture audio duration
function AudioInputWithDuration({
  value,
  onChange,
  title,
  onDurationChange
}: {
  value: File | null;
  onChange: (file: File) => void;
  title: string;
  onDurationChange: (duration: number) => void;
}) {
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const duration = e.currentTarget.duration;
    if (duration && !isNaN(duration) && isFinite(duration)) {
      onDurationChange(duration);
    }
  };

  return (
    <ToolAudioInput
      value={value}
      onChange={onChange}
      title={title}
      audioRef={audioRef}
      onLoadedMetadata={handleLoadedMetadata}
    />
  );
}
