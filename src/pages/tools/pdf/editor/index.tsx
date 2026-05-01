import React from 'react';
import { Box } from '@mui/material';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { EmbedPDF } from '@simplepdf/react-embed-pdf';

export default function PdfEditor({ title }: ToolComponentProps) {
  return (
    <ToolContent
      title={title}
      initialValues={{}}
      getGroups={null}
      input={null}
      inputComponent={
        <Box sx={{ width: '100%', height: '80vh' }}>
          {/* Warning message */}
          <Box
            sx={{ mb: 1, color: '#ff9800', fontSize: '14px', fontWeight: 500 }}
          >
            Note: Long signatures may be cut in exported PDF.
          </Box>

          {/* PDF Editor */}
          <EmbedPDF mode="inline" style={{ width: '100%', height: '100%' }} />
        </Box>
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
