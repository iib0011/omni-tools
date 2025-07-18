import { useState } from 'react';
import ToolTextResult from '@components/result/ToolTextResult';
import { decodeString } from './service';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolContent from '@components/ToolContent';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';

const initialValues = {};

const exampleCards: CardExampleType<typeof initialValues>[] = [
  {
    title: 'Decode an actual URL',
    description:
      'This example decodes a URL-encoded string back to its readable URL form.',
    sampleText: 'https%3A%2F%2Fomnitools.app%2F',
    sampleResult: 'https://omnitools.app/',
    sampleOptions: initialValues
  },
  {
    title: 'Decode All Characters',
    description:
      'This example decodes a string where every character has been URL-encoded, restoring the original readable text.',
    sampleText:
      '%49%20%63%61%6E%27%74%20%62%65%6C%69%65%76%65%20%69%74%27%73%20%6E%6F%74%20%62%75%74%74%65%72%21',
    sampleResult: "I can't believe it's not butter!",
    sampleOptions: initialValues
  }
];

export default function DecodeString({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('string');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  function compute(_initialValues: typeof initialValues, input: string) {
    setResult(decodeString(input));
  }

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={null}
      compute={compute}
      input={input}
      setInput={setInput}
      inputComponent={
        <ToolTextInput
          title={t('urlDecode.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('urlDecode.resultTitle')} value={result} />
      }
      toolInfo={{
        title: t('urlDecode.toolInfo.title', { title }),
        description: longDescription
      }}
      exampleCards={exampleCards}
    />
  );
}
