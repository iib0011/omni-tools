import React, { useState, useRef } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import { Rnd } from 'react-rnd';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc =
  '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface Field {
  id: string;
  type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'label';
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string;
}

export default function DragDropPdfEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [fields, setFields] = useState<Field[]>([]);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const pageRectsRef = useRef<{
    [page: number]: { width: number; height: number };
  }>({});

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFields([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDropField = (e: React.DragEvent, pageNo: number) => {
    e.preventDefault();
    if (!draggingField) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newField: Field = {
      id: Math.random().toString(36).slice(2),
      type: draggingField as Field['type'],
      page: pageNo,
      x,
      y,
      width: draggingField === 'textarea' ? 160 : 120,
      height: draggingField === 'textarea' ? 60 : 32
    };

    setFields((prev) => [...prev, newField]);
    setDraggingField(null);
  };

  const generatePdf = async () => {
    if (!file) return;

    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const form = pdfDoc.getForm();

    for (const field of fields) {
      const page = pdfDoc.getPages()[field.page - 1];
      const rect = pageRectsRef.current[field.page];
      if (!rect) continue;

      // scaling
      const xRatio = page.getWidth() / rect.width;
      const yRatio = page.getHeight() / rect.height;

      const fieldX = field.x * xRatio;
      const fieldY = (rect.height - field.y - field.height) * yRatio;
      const fieldWidth = field.width * xRatio;
      const fieldHeight = field.height * yRatio;

      if (field.type === 'text' || field.type === 'textarea') {
        const tf = form.createTextField(field.id);
        tf.setText(field.value || '');
        tf.addToPage(page, {
          x: fieldX,
          y: fieldY,
          width: fieldWidth,
          height: fieldHeight
        });
      } else if (field.type === 'checkbox') {
        const cb = form.createCheckBox(field.id);
        cb.addToPage(page, {
          x: fieldX,
          y: fieldY,
          width: 18,
          height: 18
        });
      } else if (field.type === 'radio') {
        const rg = form.createRadioGroup(field.id);
        rg.addOptionToPage(field.id + '_opt', page, {
          x: fieldX,
          y: fieldY,
          width: 18,
          height: 18
        });
      } else if (field.type === 'label') {
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        page.drawRectangle({
          x: fieldX,
          y: fieldY,
          width: fieldWidth,
          height: fieldHeight,
          color: rgb(1, 1, 1),
          opacity: 0.9
        });

        page.drawText(field.value || 'Label', {
          x: fieldX + 4,
          y: fieldY + fieldHeight / 2 - 7,
          size: 14,
          font: font,
          color: rgb(0, 0, 0)
        });
      }
    }

    const pdfBytesOut = await pdfDoc.save();
    const blob = new Blob([pdfBytesOut], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  // styling
  const toolboxItemStyle = {
    p: 1,
    mb: 2,
    border: '1px dashed #aaa',
    borderRadius: 1,
    textAlign: 'center',
    cursor: 'grab',
    userSelect: 'none',
    bgcolor: '#fdfdfd',
    '&:hover': { bgcolor: '#f5f5f5' }
  };

  const inputStyle = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #ccc',
    borderRadius: 4,
    fontSize: 14,
    backgroundColor: '#fff'
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Toolbox */}
      <Paper sx={{ p: 2, mr: 2, width: 240, overflowY: 'auto' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Toolbox
        </Typography>
        {/* draggable items */}
        <Box
          draggable
          onDragStart={() => setDraggingField('text')}
          sx={toolboxItemStyle}
        >
          <input
            style={{ color: '#000' }}
            type="text"
            placeholder="Text field"
            disabled
            style={inputStyle}
          />
        </Box>
        <Box
          draggable
          onDragStart={() => setDraggingField('textarea')}
          sx={toolboxItemStyle}
        >
          <textarea
            style={{ color: '#000' }}
            placeholder="Textarea"
            disabled
            style={{ ...inputStyle, height: 60 }}
          />
        </Box>
        <Box
          draggable
          onDragStart={() => setDraggingField('checkbox')}
          sx={{
            ...toolboxItemStyle,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <input style={{ color: '#000' }} type="checkbox" disabled />{' '}
          <span style={{ color: '#000' }}>Checkbox</span>
        </Box>
        <Box
          draggable
          onDragStart={() => setDraggingField('radio')}
          sx={{
            ...toolboxItemStyle,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <span
            style={{
              width: 18,
              color: '#000',
              height: 18,
              borderRadius: '50%',
              border: '2px solid #000000ff',
              display: 'inline-block'
            }}
          />{' '}
          <span style={{ color: '#000' }}>Radio</span>
        </Box>
        <Box
          draggable
          onDragStart={(e) => {
            setDraggingField('label');

            const element = document.getElementById('lbl')!;
            const rect = element.getBoundingClientRect();

            const canvas = document.createElement('canvas');
            canvas.width = rect.width;
            canvas.height = rect.height;
            const ctx = canvas.getContext('2d')!;

            ctx.fillStyle = '#fafafa';
            ctx.fillRect(0, 0, rect.width, rect.height);

            ctx.fillStyle = '#000';
            ctx.font = '14px sans-serif';
            ctx.textBaseline = 'top';
            ctx.fillText(element.innerText, 6, 6);

            const img = new Image();
            img.src = canvas.toDataURL();
            img.onload = () => {
              e.dataTransfer.setDragImage(img, 0, 0);
            };
          }}
          sx={toolboxItemStyle}
        >
          <div
            id="lbl"
            style={{
              padding: '6px',
              color: '#000',
              border: '1px dashed #bbb',
              borderRadius: 4,
              background: '#fafafa',
              fontSize: 14
            }}
          >
            Label / Text
          </div>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <input type="file" accept="application/pdf" onChange={handleUpload} />

          <Button
            variant="contained"
            sx={{ ml: 2 }}
            disabled={!fields.length}
            onClick={generatePdf}
          >
            Export & Download
          </Button>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {file && (
            <Document
              file={file}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              loading="Loading PDF..."
            >
              {Array.from({ length: numPages }, (_, i) => {
                const pageNo = i + 1;
                return (
                  <Box
                    key={pageNo}
                    sx={{
                      border: '1px solid #ccc',
                      mb: 2,
                      position: 'relative'
                    }}
                    onDrop={(e) => handleDropField(e, pageNo)}
                    onDragOver={handleDragOver}
                    ref={(el) => {
                      if (el) {
                        pageRectsRef.current[pageNo] = {
                          width: el.clientWidth,
                          height: el.clientHeight
                        };
                      }
                    }}
                  >
                    <Page pageNumber={pageNo} width={600} />

                    {fields
                      .filter((f) => f.page === pageNo)
                      .map((f) => (
                        <Rnd
                          key={f.id}
                          size={{ width: f.width, height: f.height }}
                          position={{ x: f.x, y: f.y }}
                          bounds="parent"
                          style={{ zIndex: 10 }}
                          onDragStop={(_, d) =>
                            setFields((prev) =>
                              prev.map((p) =>
                                p.id === f.id ? { ...p, x: d.x, y: d.y } : p
                              )
                            )
                          }
                          onResizeStop={(_, __, ref, ___, pos) =>
                            setFields((prev) =>
                              prev.map((p) =>
                                p.id === f.id
                                  ? {
                                      ...p,
                                      width: ref.offsetWidth,
                                      height: ref.offsetHeight,
                                      x: pos.x,
                                      y: pos.y
                                    }
                                  : p
                              )
                            )
                          }
                        >
                          {f.type === 'label' ? (
                            <div
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const newValue =
                                  e.currentTarget.innerText || '';
                                setFields((prev) =>
                                  prev.map((p) =>
                                    p.id === f.id
                                      ? { ...p, value: newValue }
                                      : p
                                  )
                                );
                              }}
                              style={{
                                width: '100%',
                                height: '100%',
                                padding: '4px 6px',
                                border: '1px dashed #999',
                                background: 'rgba(255,255,255,0.9)',
                                borderRadius: 4,
                                fontSize: 14,
                                textAlign: 'center',
                                cursor: 'text',
                                color: '#000'
                              }}
                            >
                              {f.value || 'Label'}
                            </div>
                          ) : f.type === 'radio' ? (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <span
                                style={{
                                  width: Math.min(f.width, f.height) - 4,
                                  height: Math.min(f.width, f.height) - 4,
                                  borderRadius: '50%',
                                  border: '2px solid #1976d2',
                                  background: '#fff',
                                  display: 'inline-block'
                                }}
                              />
                            </div>
                          ) : f.type === 'checkbox' ? (
                            <input
                              type="checkbox"
                              style={{ width: '100%', height: '100%' }}
                            />
                          ) : (
                            <input
                              type="text"
                              placeholder={
                                f.type === 'textarea' ? 'Textarea' : 'Text'
                              }
                              style={{
                                width: '100%',
                                height: '100%',
                                border: '1px solid #333',
                                borderRadius: 4,
                                padding: '4px 6px',
                                backgroundColor: 'white',
                                fontSize: 14
                              }}
                            />
                          )}
                        </Rnd>
                      ))}
                  </Box>
                );
              })}
            </Document>
          )}
        </Box>
      </Box>
    </Box>
  );
}
