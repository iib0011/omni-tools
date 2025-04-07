import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType, UpdateField } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { updateNumberField } from '@utils/string';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { debounce } from 'lodash';
import ToolVideoInput from '@components/input/ToolVideoInput';
import { InitialValuesType } from './types';

const ffmpeg = new FFmpeg();

const initialValues: InitialValuesType = {
  width: 640,
  height: 360,
  x: 0,
  y: 0
};

const validationSchema = Yup.object({
  width: Yup.number()
    .min(1, 'Width must be at least 1px')
    .required('Width is required'),
  height: Yup.number()
    .min(1, 'Height must be at least 1px')
    .required('Height is required'),
  x: Yup.number()
    .min(0, 'X position must be positive')
    .required('X position is required'),
  y: Yup.number()
    .min(0, 'Y position must be positive')
    .required('Y position is required')
});

export default function CropVideo({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [videoInfo, setVideoInfo] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Get video dimensions when a video is loaded
  useEffect(() => {
    if (input) {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        setVideoInfo({
          width: video.videoWidth,
          height: video.videoHeight
        });
      };
      video.src = URL.createObjectURL(input);
    } else {
      setVideoInfo(null);
    }
  }, [input]);

  const compute = async (
    optionsValues: InitialValuesType,
    input: File | null
  ) => {
    if (!input || !videoInfo) return;
    try {
      setIsProcessing(true);

      // Ensure values are within video bounds
      const cropWidth = Math.min(
        optionsValues.width,
        videoInfo.width - optionsValues.x
      );
      const cropHeight = Math.min(
        optionsValues.height,
        videoInfo.height - optionsValues.y
      );
      const cropX = Math.min(optionsValues.x, videoInfo.width - cropWidth);
      const cropY = Math.min(optionsValues.y, videoInfo.height - cropHeight);

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

      // Run FFmpeg command to crop video
      // The crop filter format is: crop=width:height:x:y
      await ffmpeg.exec([
        '-i',
        inputName,
        '-vf',
        `crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}`,
        '-c:a',
        'copy',
        outputName
      ]);

      // Retrieve the processed file
      const croppedData = await ffmpeg.readFile(outputName);
      const croppedBlob = new Blob([croppedData], { type: 'video/mp4' });
      const croppedFile = new File(
        [croppedBlob],
        `${input.name.replace(/\.[^/.]+$/, '')}_cropped.mp4`,
        {
          type: 'video/mp4'
        }
      );

      setResult(croppedFile);
    } catch (error) {
      console.error('Error cropping video:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const debouncedCompute = useCallback(debounce(compute, 1000), [videoInfo]);

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Crop Settings',
      component: (
        <Box>
          <TextFieldWithDesc
            onOwnChange={(value) =>
              updateNumberField(value, 'width', updateField)
            }
            value={values.width}
            label={'Width (pixels)'}
            sx={{ mb: 2, backgroundColor: 'background.paper' }}
            helperText={videoInfo ? `Original width: ${videoInfo.width}px` : ''}
          />
          <TextFieldWithDesc
            onOwnChange={(value) =>
              updateNumberField(value, 'height', updateField)
            }
            value={values.height}
            label={'Height (pixels)'}
            sx={{ mb: 2, backgroundColor: 'background.paper' }}
            helperText={
              videoInfo ? `Original height: ${videoInfo.height}px` : ''
            }
          />
          <TextFieldWithDesc
            onOwnChange={(value) => updateNumberField(value, 'x', updateField)}
            value={values.x}
            label={'X Position (pixels)'}
            sx={{ mb: 2, backgroundColor: 'background.paper' }}
          />
          <TextFieldWithDesc
            onOwnChange={(value) => updateNumberField(value, 'y', updateField)}
            value={values.y}
            label={'Y Position (pixels)'}
            sx={{ mb: 2, backgroundColor: 'background.paper' }}
          />
        </Box>
      )
    }
  ];
  const handleCropChange =
    (values: InitialValuesType, updateField: UpdateField<InitialValuesType>) =>
    (
      position: { x: number; y: number },
      size: { width: number; height: number }
    ) => {
      console.log('Crop position:', position, size);
      updateField('x', position.x);
      updateField('y', position.y);
      updateField('width', size.width);
      updateField('height', size.height);
    };
  const renderCustomInput = (
    values: InitialValuesType,
    updateField: UpdateField<InitialValuesType>
  ) => (
    <ToolVideoInput
      value={input}
      onChange={setInput}
      accept={['video/mp4', 'video/webm', 'video/ogg']}
      title={'Input Video'}
      showCropOverlay={!!input}
      cropPosition={{
        x: parseInt(values.x || '0'),
        y: parseInt(values.y || '0')
      }}
      cropSize={{
        width: parseInt(values.width || '100'),
        height: parseInt(values.height || '100')
      }}
      onCropChange={handleCropChange(values, updateField)}
    />
  );
  return (
    <ToolContent
      title={title}
      input={input}
      renderCustomInput={renderCustomInput}
      resultComponent={
        <ToolFileResult
          title={'Cropped Video'}
          value={result}
          extension={'mp4'}
          loading={isProcessing}
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={debouncedCompute}
      setInput={setInput}
      validationSchema={validationSchema}
      toolInfo={{
        title: 'How to crop a video',
        description:
          'Video cropping allows you to remove unwanted outer areas from your video frames. Specify the width, height, X position, and Y position to define the crop region. The X and Y positions determine the top-left corner of the crop area.'
      }}
    />
  );
}
