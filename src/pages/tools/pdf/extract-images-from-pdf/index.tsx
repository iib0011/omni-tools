import { useState, useEffect } from 'react';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolPdfInput from '@components/input/ToolPdfInput';
import { processPDF } from './service';

export default function PdfToEpub({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const compute = async (options: {}, input: File | null) => {
    if (!input) return;
    try {
      setIsProcessing(true);
      setResult(null);
      const epub = await processPDF(input);
      setResult(epub);
    } catch (error) {
      console.error('Failed to extract images from PDF:', error);
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
          title={'Extracted Images'}
          value={result}
          extension={'epub'}
          loading={isProcessing}
          loadingText={'Extracting Images from PDF File...'}
        />
      }
      toolInfo={{
        title: 'How to Extract Images from PDF File?',
        description: `Upload a PDF file and this tool will extract its images for you to download.`
      }}
    />
  );
}
