import React, { useState, useMemo } from 'react';
import { Box, Button } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';

pdfjs.GlobalWorkerOptions.workerSrc =
  '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

type Field = {
  type: 'text' | 'checkbox';
  name: string;
  x: number;
  y: number;
  page: number;
};

export default function DragDropPdfEditor() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [numPages, setNumPages] = useState<number>(0);

  const fileProp = useMemo(
    () => (pdfBytes ? { data: pdfBytes } : null),
    [pdfBytes]
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    setPdfBytes(new Uint8Array(arrayBuffer)); // fresh copy
  };

  const handlePlaceField = (
    e: React.MouseEvent<HTMLDivElement>,
    page: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = rect.height - (e.clientY - rect.top);

    setFields((prev) => [
      ...prev,
      { type: 'text', name: `field_${prev.length + 1}`, x, y, page }
    ]);
  };

  const generatePdf = async () => {
    if (!pdfBytes) return;
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    for (const field of fields) {
      const page = pdfDoc.getPages()[field.page - 1];
      if (field.type === 'text') {
        const textField = form.createTextField(field.name);
        textField.addToPage(page, {
          x: field.x,
          y: field.y,
          width: 150,
          height: 20
        });
      } else if (field.type === 'checkbox') {
        const checkBox = form.createCheckBox(field.name);
        checkBox.addToPage(page, {
          x: field.x,
          y: field.y,
          width: 20,
          height: 20
        });
      }
    }

    const newPdf = await pdfDoc.save();
    const blob = new Blob([newPdf], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'fillable.pdf';
    link.click();
  };

  return (
    <Box sx={{ p: 4 }}>
      <input type="file" accept="application/pdf" onChange={handleUpload} />
      <Button
        variant="contained"
        sx={{ ml: 2 }}
        disabled={!fields.length}
        onClick={generatePdf}
      >
        Export Fillable PDF
      </Button>

      {fileProp && (
        <Box sx={{ mt: 3 }}>
          <Document
            file={fileProp}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading="Loading PDF..."
          >
            {Array.from({ length: numPages }, (_, i) => (
              <Box
                key={i}
                sx={{ border: '1px solid #ccc', mb: 2, position: 'relative' }}
                onClick={(e) => handlePlaceField(e, i + 1)}
              >
                <Page pageNumber={i + 1} width={600} />
                {fields
                  .filter((f) => f.page === i + 1)
                  .map((f, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        position: 'absolute',
                        left: f.x,
                        bottom: f.y,
                        width: f.type === 'text' ? 150 : 20,
                        height: f.type === 'text' ? 20 : 20,
                        border: '1px dashed red',
                        background: 'rgba(255,0,0,0.1)'
                      }}
                    >
                      {f.type === 'text' ? 'Text' : '✔'}
                    </Box>
                  ))}
              </Box>
            ))}
          </Document>
        </Box>
      )}
    </Box>
  );
}
