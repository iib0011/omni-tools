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
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import RadioWithTextField from '@components/options/RadioWithTextField';
import SimpleRadio from '@components/options/SimpleRadio';

const initialValues: InitialValuesType = {
  quality: 'mid',
  fps: '10',
  scale: 'scale=320:-1:flags=bicubic'
};

export default function VideoToGif({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setIsLoading] = useState(false);

  const compute = (values: InitialValuesType, input: File | null) => {
    setResult(main(input, values));
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
              updateField('scale', 'scale=240:-1:flags=bilinear');
            }}
            checked={values.quality === 'low'}
          />
          <SimpleRadio
            title="Mid"
            onClick={() => {
              updateField('quality', 'mid');
              updateField('fps', '10');
              updateField('scale', 'scale=320:-1:flags=bicubic');
            }}
            checked={values.quality === 'mid'}
          />
          <SimpleRadio
            title="High"
            onClick={() => {
              updateField('quality', 'high');
              updateField('fps', '15');
              updateField('scale', 'scale=480:-1:flags=lanczos');
            }}
            checked={values.quality === 'high'}
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
