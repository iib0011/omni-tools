import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolPdfInput from '@components/input/ToolPdfInput';
import { ToolComponentProps } from '@tools/defineTool';
import { convertPdfToDOCX } from './service';
import ToolMultiFileResult from '@components/result/ToolMultiFileResult';

export default function PdfToDocx({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [docx, setDocx] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (_: {}, file: File | null) => {
    if (!file) return;
    setLoading(true);
    setDocx(null);
    try {
      const { file: docxFile } = await convertPdfToDOCX(file);
      setDocx(docxFile);
    } catch (err) {
      console.error('Conversion failed:', err);
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
        <ToolMultiFileResult
          title="Converted DOCX File"
          value={docx ? [docx] : []}
          loading={loading}
          loadingText="Converting PDF to DOCX..."
        />
      }
      getGroups={null}
      toolInfo={{
        title: 'Convert PDF to DOCX',
        description:
          'Upload your PDF and get it converted into a DOCX document.'
      }}
    />
  );
}
