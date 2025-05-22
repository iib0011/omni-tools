/* eslint-disable prettier/prettier */
import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { main } from './service';
import { InitialValuesType } from './types';
import ToolVideoInput from '@components/input/ToolVideoInput';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';

const initialValues: InitialValuesType = {
  newSpeed: 2
};

// TODO - Add the ffmpeg logic
export default function ChangeSpeed({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = (optionsValues: InitialValuesType, input: File | null) => {
    if (!input) return;
    const { newSpeed } = optionsValues;

    // Here we set the output video
    setResult(main(input, optionsValues));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
      {
        title: 'New Video Speed',
        component: (
          <Box>
            <TextFieldWithDesc
              value={values.newSpeed.toString()}
              onOwnChange={(val) => updateField('newSpeed', Number(val))}
              description="Default multiplier: 2 means 2x faster"
              type="number"
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
        <ToolVideoInput
          value={input}
          onChange={setInput}
          title={'Input Video'}
        />
      }
      resultComponent={
        loading ? (
          <ToolFileResult
            title="Setting Speed"
            value={null}
            loading={true}
            extension={''}
          />
        ) : (
          <ToolFileResult title="Edited Video" value={result} extension="mp4" />
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
