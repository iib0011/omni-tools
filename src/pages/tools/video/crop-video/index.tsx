import { Box, Typography, TextField, Alert } from '@mui/material';
import React, { useState, useMemo, useEffect } from 'react';
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
  const { t } = useTranslation('video');

  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [videoDimensions, setVideoDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const [processingError, setProcessingError] = useState('');

  const validateDimensions = (values: InitialValuesType): string => {
    if (!videoDimensions) return '';

    if (values.x < 0 || values.y < 0) {
      return t('cropVideo.errorNonNegativeCoordinates');
    }

    if (values.width <= 0 || values.height <= 0) {
      return t('cropVideo.errorPositiveDimensions');
    }

    if (values.x + values.width > videoDimensions.width) {
      return t('cropVideo.errorBeyondWidth', {
        width: videoDimensions.width
      });
    }

    if (values.y + values.height > videoDimensions.height) {
      return t('cropVideo.errorBeyondHeight', {
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
      setProcessingError(t('cropVideo.errorCroppingVideo'));
    } finally {
      setLoading(false);
    }
  };

  const debouncedCompute = useMemo(
    () => debounce(compute, 2000),
    [videoDimensions]
  );

  useEffect(() => {
    return () => {
      debouncedCompute.cancel();
    };
  }, [debouncedCompute]);

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => {
    const maxVideoWidth = videoDimensions?.width ?? 0;
    const maxVideoHeight = videoDimensions?.height ?? 0;

    const maxX = videoDimensions
      ? Math.max(0, maxVideoWidth - values.width)
      : 0;

    const maxY = videoDimensions
      ? Math.max(0, maxVideoHeight - values.height)
      : 0;

    return [
      {
        title: t('cropVideo.videoInformation'),
        component: (
          <Box>
            {videoDimensions ? (
              <Typography variant="body2">
                {t('cropVideo.videoDimensions', {
                  width: videoDimensions.width,
                  height: videoDimensions.height
                })}
              </Typography>
            ) : (
              <Typography variant="body2">
                {t('cropVideo.loadVideoForDimensions')}
              </Typography>
            )}
          </Box>
        )
      },
      {
        title: t('cropVideo.cropCoordinates'),
        component: (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {processingError && (
              <Alert severity="error">{processingError}</Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t('cropVideo.xCoordinate')}
                type="number"
                value={values.x}
                onChange={(e) =>
                  updateField(
                    'x',
                    Math.max(0, Math.min(maxX, Number(e.target.value) || 0))
                  )
                }
                size="small"
                inputProps={{
                  min: 0,
                  max: maxX
                }}
                disabled={!videoDimensions}
              />

              <TextField
                label={t('cropVideo.yCoordinate')}
                type="number"
                value={values.y}
                onChange={(e) =>
                  updateField(
                    'y',
                    Math.max(0, Math.min(maxY, Number(e.target.value) || 0))
                  )
                }
                size="small"
                inputProps={{
                  min: 0,
                  max: maxY
                }}
                disabled={!videoDimensions}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label={t('cropVideo.width')}
                type="number"
                value={values.width}
                onChange={(e) => {
                  const width = Math.max(
                    1,
                    Math.min(maxVideoWidth, Number(e.target.value) || 1)
                  );

                  updateField('width', width);
                  updateField('x', Math.min(values.x, maxVideoWidth - width));
                }}
                size="small"
                inputProps={{
                  min: 1,
                  max: maxVideoWidth
                }}
                disabled={!videoDimensions}
              />

              <TextField
                label={t('cropVideo.height')}
                type="number"
                value={values.height}
                onChange={(e) => {
                  const height = Math.max(
                    1,
                    Math.min(maxVideoHeight, Number(e.target.value) || 1)
                  );

                  updateField('height', height);
                  updateField('y', Math.min(values.y, maxVideoHeight - height));
                }}
                size="small"
                inputProps={{
                  min: 1,
                  max: maxVideoHeight
                }}
                disabled={!videoDimensions}
              />
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
      renderCustomInput={(values, setFieldValue) => (
        <ToolVideoInput
          value={input}
          onChange={(video) => {
            if (video) {
              getVideoDimensions(video)
                .then((dimensions) => {
                  const newValues: InitialValuesType = {
                    x: Math.floor(dimensions.width / 4),
                    y: Math.floor(dimensions.height / 4),
                    width: Math.floor(dimensions.width / 2),
                    height: Math.floor(dimensions.height / 2)
                  };

                  setFieldValue('x', newValues.x);
                  setFieldValue('y', newValues.y);
                  setFieldValue('width', newValues.width);
                  setFieldValue('height', newValues.height);

                  setVideoDimensions(dimensions);
                  setProcessingError('');
                })
                .catch(() => {
                  setProcessingError(t('cropVideo.errorLoadingDimensions'));
                });
            } else {
              setVideoDimensions(null);
              setProcessingError('');
            }

            setInput(video);
          }}
          title={t('cropVideo.inputTitle')}
        />
      )}
      resultComponent={
        <ToolFileResult
          title={t('cropVideo.resultTitle')}
          loading={loading}
          value={result}
          extension="mp4"
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={debouncedCompute}
      setInput={setInput}
    />
  );
}
