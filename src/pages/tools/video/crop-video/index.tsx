import { Box, TextField, Typography, Alert } from '@mui/material';
import { useCallback, useState, useEffect } from 'react';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { debounce } from 'lodash';
import ToolVideoInput from '@components/input/ToolVideoInput';
import { cropVideo, getVideoDimensions } from './service';
import { InitialValuesType } from './types';

export const initialValues: InitialValuesType = {
  x: 0,
  y: 0,
  width: 100,
  height: 100
};

export default function CropVideo({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [processingError, setProcessingError] = useState<string>('');

  useEffect(() => {
    if (input) {
      getVideoDimensions(input)
        .then((dimensions) => {
          setVideoDimensions(dimensions);
          setProcessingError('');
        })
        .catch((error) => {
          console.error('Error getting video dimensions:', error);
          setProcessingError('Failed to load video dimensions');
        });
    } else {
      setVideoDimensions(null);
      setProcessingError('');
    }
  }, [input]);

  const validateDimensions = (values: InitialValuesType): string => {
    if (!videoDimensions) return '';

    if (values.x < 0 || values.y < 0) {
      return 'X and Y coordinates must be non-negative';
    }

    if (values.width <= 0 || values.height <= 0) {
      return 'Width and height must be positive';
    }

    if (values.x + values.width > videoDimensions.width) {
      return `Crop area extends beyond video width (${videoDimensions.width}px)`;
    }

    if (values.y + values.height > videoDimensions.height) {
      return `Crop area extends beyond video height (${videoDimensions.height}px)`;
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
      setProcessingError(
        'Error cropping video. Please check parameters and video file.'
      );
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
      title: 'Video Information',
      component: (
        <Box>
          {videoDimensions ? (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Video dimensions: {videoDimensions.width} ×{' '}
              {videoDimensions.height} pixels
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ mb: 2 }}>
              Load a video to see dimensions
            </Typography>
          )}
        </Box>
      )
    },
    {
      title: 'Crop Coordinates',
      component: (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {processingError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {processingError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="X (left)"
              type="number"
              value={values.x}
              onChange={(e) => updateField('x', parseInt(e.target.value) || 0)}
              size="small"
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Y (top)"
              type="number"
              value={values.y}
              onChange={(e) => updateField('y', parseInt(e.target.value) || 0)}
              size="small"
              inputProps={{ min: 0 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Width"
              type="number"
              value={values.width}
              onChange={(e) =>
                updateField('width', parseInt(e.target.value) || 0)
              }
              size="small"
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Height"
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
            title={'Cropping Video'}
            value={null}
            loading={true}
            extension={''}
          />
        ) : (
          <ToolFileResult
            title={'Cropped Video'}
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
