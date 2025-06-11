import { useState, useEffect } from 'react';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolPdfInput from '@components/input/ToolPdfInput';
import { convertPdfToEpub } from './service';

export default function PdfToEpub({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const compute = async (options: {}, input: File | null) => {
    if (!input) return;
    try {
      setIsProcessing(true);
      setResult(null);
      const epub = await convertPdfToEpub(input);
      setResult(epub);
    } catch (error) {
      console.error('Failed to convert PDF to EPUB:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolContent
      title={title}
      input={input}
      setInput={setInput}
      initialValues={{}}
      compute={compute}
      inputComponent={
        <ToolPdfInput
          value={input}
          onChange={(file) => setInput(file)}
          accept={['application/pdf']}
          title={'Input PDF'}
        />
      }
      getGroups={null}
      resultComponent={
        <ToolFileResult
          title={'EPUB Output'}
          value={result}
          extension={'epub'}
          loading={isProcessing}
          loadingText={'Converting PDF to EPUB...'}
        />
      }
      toolInfo={{ title: title, description: longDescription }}
    />
  );
}
