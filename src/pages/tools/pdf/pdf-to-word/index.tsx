import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolPdfInput from '@components/input/ToolPdfInput';
import { ToolComponentProps } from '@tools/defineTool';
import ToolFileResult from '@components/result/ToolFileResult';
import { convertPdfToWord } from './service';

export default function PdfToWord({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const compute = async (_: {}, file: File | null) => {
    if (!file) return;
    setIsProcessing(true);
    setResult(null);
    try {
      setResult(await convertPdfToWord(file));
    } catch (err) {
      console.error('Conversion failed:', err);
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
          onChange={setInput}
          accept={['application/pdf']}
          title="Input PDF"
        />
      }
      getGroups={null}
      resultComponent={
        <ToolFileResult
          title="Word Output"
          value={result}
          extension="docx"
          loading={isProcessing}
          loadingText="Converting PDF to Word..."
        />
      }
      toolInfo={{
        title: 'How to Use PDF to Word?',
        description:
          'Upload a PDF file and this tool will extract the text and convert it into a .docx Word document, compatible with Microsoft Word and other word processors.'
      }}
    />
  );
}
