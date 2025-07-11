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

  console.log('MergeVideo component rendering, input:', input);

  const compute = async (
    _values: InitialValuesType,
    input: MultiVideoInput[]
  ) => {
    console.log('Compute called with input:', input);
    if (!input || input.length < 2) {
      console.log('Not enough files to merge');
      return;
    }
    setLoading(true);
    try {
      const files = input.map((item) => item.file);
      console.log(
        'Files to merge:',
        files.map((f) => f.name)
      );
      const mergedBlob = await mergeVideos(files, initialValues);
      const mergedFile = new File([mergedBlob], 'merged-video.mp4', {
        type: 'video/mp4'
      });
      setResult(mergedFile);
      console.log('Merge successful');
    } catch (err) {
      console.error(`Failed to merge video: ${err}`);
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
            console.log('Input changed:', newInput);
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
