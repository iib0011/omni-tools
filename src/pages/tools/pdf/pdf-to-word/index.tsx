import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolPdfInput from '@components/input/ToolPdfInput';
import { ToolComponentProps } from '@tools/defineTool';
import { convertPdfToDocx } from './service';

export default function PdfToWord({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [outputFile, setOutputFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (_: {}, file: File | null) => {
    if (!file) return;
    setLoading(true);
    setOutputFile(null);
    try {
      const result = await convertPdfToDocx(file);
      console.log('outputFile:', result);
      setOutputFile(result);
    } catch (err) {
      console.error('PDF to Word conversion failed:', err);
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
        outputFile ? (
          <a
            href={URL.createObjectURL(outputFile)}
            download={outputFile.name}
            style={{
              padding: '10px 15px',
              backgroundColor: '#1976d2',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-block',
              marginTop: '20px'
            }}
          >
            Download {outputFile.name}
          </a>
        ) : null
      }
      getGroups={null}
      toolInfo={{
        title: 'Convert PDF to Word',
        description:
          'Upload your PDF and get a real .docx Word document with extracted text.'
      }}
    />
  );
}
