import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolAudioInput from '@components/input/ToolAudioInput';
import ToolFileResult from '@components/result/ToolFileResult';

import { AACtoMp3 } from './service';

export default function AACMP3({ title, longDescription }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (
    _optionsValues: {},
    input: File | null
  ): Promise<void> => {
    if (!input) return;

    try {
      if (!input.name.toLowerCase().endsWith('.aac')) {
        setInput(null);
        alert('please upload .aac files are allowed.');
        setResult(null);

        return;
      }
      setLoading(true);
      const resultFile = await AACtoMp3(input);
      setResult(resultFile);
    } catch (error) {
      console.error('Conversion failed:', error);
      setResult(null);
    }
    setLoading(false);
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolAudioInput
          value={input}
          onChange={setInput}
          title={'Upload Your AAC File'}
        />
      }
      resultComponent={
        <ToolFileResult value={result} title={'Mp3 Output'} loading={loading} />
      }
      initialValues={{}}
      getGroups={null}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
