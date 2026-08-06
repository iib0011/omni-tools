import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolMultipleVideoInput, {
  MultiVideoInput
} from '@components/input/ToolMultipleVideoInput';
import { mergeVideos } from './service';
import { useTranslation } from 'react-i18next';

const initialValues = {};

type InitialValuesType = typeof initialValues;

export default function MergeVideo({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('video');
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
      const resultFile = await mergeVideos(input.map((item) => item.file));

      setResult(resultFile);
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
          accept={['video/*']}
          title={t('mergeVideo.inputTitle')}
          type="video"
        />
      }
      resultComponent={
        <ToolFileResult
          value={result}
          title={t('mergeVideo.resultTitle')}
          loading={loading}
          extension={'mp4'}
        />
      }
      initialValues={initialValues}
      getGroups={null}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `${title} ?`, description: longDescription }}
    />
  );
}
