import React, { useState } from 'react';
import { Box } from '@mui/material';
import ToolPdfInput from '@components/input/ToolPdfInput';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { EmbedPDF } from '@simplepdf/react-embed-pdf';

export default function PdfEditor({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const onFileChange = (file: File | null) => {
    if (file) {
      setInput(file);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    } else {
      setInput(null);
      setPdfUrl(null);
    }
  };

  return (
    <ToolContent
      title={title}
      initialValues={{}}
      getGroups={null}
      input={input}
      inputComponent={
        <>
          {pdfUrl ? (
            <Box sx={{ width: '100%', height: '80vh' }}>
              <EmbedPDF
                mode="inline"
                style={{ width: '100%', height: '100%' }}
                documentURL={pdfUrl}
              />
            </Box>
          ) : (
            <ToolPdfInput
              value={input}
              onChange={onFileChange}
              accept={['application/pdf']}
              title="Upload a PDF to edit"
            />
          )}
        </>
      }
      toolInfo={{
        title: 'PDF Editor',
        description:
          'Edit, annotate, highlight, fill forms, and export your PDFs entirely in the browser. Add text, drawings, signatures, and more to your PDF documents with this powerful online editor.'
      }}
      compute={() => {
        /* no background compute required */
      }}
    />
  );
}
