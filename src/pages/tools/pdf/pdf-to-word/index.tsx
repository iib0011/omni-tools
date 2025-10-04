import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolPdfInput from '@components/input/ToolPdfInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { ToolComponentProps } from '@tools/defineTool';
import { convertPdfToWord } from './service';

export default function PdfToWord({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [wordFile, setWordFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (_: {}, file: File | null) => {
    if (!file) return;

    setLoading(true);
    setWordFile(null);

    try {
      const convertedFile = await convertPdfToWord(file);
      setWordFile(convertedFile);
    } catch (err) {
      console.error('Conversion failed:', err);
      // You could add error handling here with a snackbar or alert
    } finally {
      setLoading(false);
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
          title="Upload a PDF"
        />
      }
      resultComponent={
        <ToolFileResult
          title="Converted Word Document"
          value={wordFile}
          loading={loading}
          loadingText="Converting PDF to Word..."
        />
      }
      getGroups={null}
      toolInfo={{
        title: 'PDF to Word Converter',
        description:
          'This tool converts PDF documents to editable Word (.docx) format. The conversion preserves text content, basic formatting, and images when possible. The resulting Word document can be opened and edited in Microsoft Word or compatible applications.'
      }}
    />
  );
}
