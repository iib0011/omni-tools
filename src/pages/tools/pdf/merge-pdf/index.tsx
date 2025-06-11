import { useState } from 'react';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { mergePdf } from './service';
import ToolMultiPdfInput, {
  MultiPdfInput
} from '@components/input/ToolMultiplePdfInput';

export default function MergePdf({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<MultiPdfInput[]>([]);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const compute = async (values: File[], input: MultiPdfInput[]) => {
    if (input.length === 0) {
      return;
    }

    try {
      setIsProcessing(true);
      const mergeResult = await mergePdf(input.map((i) => i.file));
      setResult(mergeResult);
    } catch (error) {
      throw new Error('Error merging PDF:' + error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolContent
      title={title}
      input={input}
      setInput={setInput}
      initialValues={input.map((i) => i.file)}
      compute={compute}
      inputComponent={
        <ToolMultiPdfInput
          value={input}
          onChange={(pdfInputs) => {
            setInput(pdfInputs);
          }}
          accept={['application/pdf']}
          title={'Input PDF'}
          type="pdf"
        />
      }
      getGroups={null}
      resultComponent={
        <ToolFileResult
          title={'Output merged PDF'}
          value={result}
          extension={'pdf'}
          loading={isProcessing}
          loadingText={'Extracting pages'}
        />
      }
      toolInfo={{ title: title, description: longDescription }}
    />
  );
}
