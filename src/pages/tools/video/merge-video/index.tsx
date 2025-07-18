import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolMultipleVideoInput, {
  MultiVideoInput
} from '@components/input/ToolMultipleVideoInput';
import { mergeVideos } from './service';
import { InitialValuesType } from './types';

const initialValues: InitialValuesType = {};

export default function MergeVideo({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<MultiVideoInput[]>([]);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (
    _values: InitialValuesType,
    input: MultiVideoInput[]
  ) => {
    if (!input || input.length < 2) {
      return;
    }
    setLoading(true);
    try {
      const files = input.map((item) => item.file);
      const mergedBlob = await mergeVideos(files, initialValues);
      const mergedFile = new File([mergedBlob], 'merged-video.mp4', {
        type: 'video/mp4'
      });
      setResult(mergedFile);
    } catch (err) {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolMultipleVideoInput
          value={input}
          onChange={(newInput) => {
            setInput(newInput);
          }}
          accept={['video/*', '.mp4', '.avi', '.mov', '.mkv']}
          title="Input Videos"
          type="video"
        />
      }
      resultComponent={
        <ToolFileResult
          value={result}
          title={loading ? 'Merging Videos...' : 'Merged Video'}
          loading={loading}
          extension={'mp4'}
        />
      }
      initialValues={initialValues}
      getGroups={null}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
