import { Box, Typography, TextField, Alert } from '@mui/material';
import React, { useState, useCallback } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { cropVideo, getVideoDimensions } from './service';
import { InitialValuesType } from './types';
import ToolVideoInput from '@components/input/ToolVideoInput';
import { GetGroupsType } from '@components/options/ToolOptions';
import ToolFileResult from '@components/result/ToolFileResult';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  x: 0,
  y: 0,
  width: 100,
  height: 100
};

export default function CropVideo({ title }: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [processingError, setProcessingError] = useState<string>('');

  const validateDimensions = (values: InitialValuesType): string => {
    if (!videoDimensions) return '';

    if (values.x < 0 || values.y < 0) {
      return t('video.cropVideo.errorNonNegativeCoordinates');
    }

    if (values.width <= 0 || values.height <= 0) {
      return t('video.cropVideo.errorPositiveDimensions');
    }

    if (values.x + values.width > videoDimensions.width) {
      return t('video.cropVideo.errorBeyondWidth', {
        width: videoDimensions.width
      });
    }

    if (values.y + values.height > videoDimensions.height) {
      return t('video.cropVideo.errorBeyondHeight', {
        height: videoDimensions.height
      });
    }

    return '';
  };

  const compute = async (
    optionsValues: InitialValuesType,
    input: File | null
  ) => {
    if (!input) return;

    const error = validateDimensions(optionsValues);
    if (error) {
      setProcessingError(error);
      return;
    }

    setProcessingError('');
    setLoading(true);

    try {
      const croppedFile = await cropVideo(input, optionsValues);
      setResult(croppedFile);
    } catch (error) {
      console.error('Error cropping video:', error);
      setProcessingError(t('video.cropVideo.errorCroppingVideo'));
    } finally {
      setLoading(false);
    }
  };

  // 2 seconds to avoid starting job half way through
  const debouncedCompute = useCallback(debounce(compute, 2000), [
    videoDimensions
  ]);

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('video.cropVideo.videoInformation'),
      component: (
        <Box>
          {videoDimensions ? (
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t('video.cropVideo.videoDimensions', {
                width: videoDimensions.width,
                height: videoDimensions.height
              })}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ mb: 2 }}>
              {t('video.cropVideo.loadVideoForDimensions')}
            </Typography>
          )}
        </Box>
      )
    },
    {
      title: t('video.cropVideo.cropCoordinates'),
      component: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {processingError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {processingError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label={t('video.cropVideo.xCoordinate')}
              type="number"
              value={values.x}
              onChange={(e) => updateField('x', parseInt(e.target.value) || 0)}
              size="small"
              inputProps={{ min: 0 }}
            />
            <TextField
              label={t('video.cropVideo.yCoordinate')}
              type="number"
              value={values.y}
              onChange={(e) => updateField('y', parseInt(e.target.value) || 0)}
              size="small"
              inputProps={{ min: 0 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label={t('video.cropVideo.width')}
              type="number"
              value={values.width}
              onChange={(e) =>
                updateField('width', parseInt(e.target.value) || 0)
              }
              size="small"
              inputProps={{ min: 1 }}
            />
            <TextField
              label={t('video.cropVideo.height')}
              type="number"
              value={values.height}
              onChange={(e) =>
                updateField('height', parseInt(e.target.value) || 0)
              }
              size="small"
              inputProps={{ min: 1 }}
            />
          </Box>
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      renderCustomInput={(values, setFieldValue) => (
        <ToolVideoInput
          value={input}
          onChange={(video) => {
            if (video) {
              getVideoDimensions(video)
                .then((dimensions) => {
                  const newOptions: InitialValuesType = {
                    x: dimensions.width / 4,
                    y: dimensions.height / 4,
                    width: dimensions.width / 2,
                    height: dimensions.height / 2
                  };
                  setFieldValue('x', newOptions.x);
                  setFieldValue('y', newOptions.y);
                  setFieldValue('width', newOptions.width);
                  setFieldValue('height', newOptions.height);

                  setVideoDimensions(dimensions);
                  setProcessingError('');
                })
                .catch((error) => {
                  console.error('Error getting video dimensions:', error);
                  setProcessingError(
                    t('video.cropVideo.errorLoadingDimensions')
                  );
                });
            } else {
              setVideoDimensions(null);
              setProcessingError('');
            }
            setInput(video);
          }}
          title={t('video.cropVideo.inputTitle')}
        />
      )}
      resultComponent={
        loading ? (
          <ToolFileResult
            title={t('video.cropVideo.croppingVideo')}
            value={null}
            loading={true}
            extension={''}
          />
        ) : (
          <ToolFileResult
            title={t('video.cropVideo.resultTitle')}
            value={result}
            extension={'mp4'}
          />
        )
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={debouncedCompute}
      setInput={setInput}
    />
  );
}
