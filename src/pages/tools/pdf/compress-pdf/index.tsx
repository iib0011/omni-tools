import { Box, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolPdfInput from '@components/input/ToolPdfInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import { PDFDocument } from 'pdf-lib';
import { CompressionLevel, InitialValuesType } from './types';
import { compressPdf } from './service';
import SimpleRadio from '@components/options/SimpleRadio';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';

const initialValues: InitialValuesType = {
  compressionLevel: 'medium'
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Low Compression',
    description: 'Slightly reduce file size with minimal quality loss',
    sampleText: '',
    sampleResult: '',
    sampleOptions: {
      compressionLevel: 'low'
    }
  },
  {
    title: 'Medium Compression',
    description: 'Balance between file size and quality',
    sampleText: '',
    sampleResult: '',
    sampleOptions: {
      compressionLevel: 'medium'
    }
  },
  {
    title: 'High Compression',
    description: 'Maximum file size reduction with some quality loss',
    sampleText: '',
    sampleResult: '',
    sampleOptions: {
      compressionLevel: 'high'
    }
  }
];

export default function CompressPdf({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [resultSize, setResultSize] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [fileInfo, setFileInfo] = useState<{
    size: string;
    pages: number;
  } | null>(null);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  // Get the PDF info when a file is uploaded
  useEffect(() => {
    const getPdfInfo = async () => {
      if (!input) {
        setFileInfo(null);
        return;
      }

      try {
        const arrayBuffer = await input.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = pdf.getPageCount();
        const size = formatFileSize(input.size);

        setFileInfo({ size, pages });
      } catch (error) {
        console.error('Error getting PDF info:', error);
        setFileInfo(null);
        showSnackBar(
          'Error reading PDF file. Please make sure it is a valid PDF.',
          'error'
        );
      }
    };

    getPdfInfo();
  }, [input]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) return;

    try {
      setIsProcessing(true);
      const compressedPdf = await compressPdf(input, values);
      setResult(compressedPdf);

      // Log compression results
      const compressionRatio = (compressedPdf.size / input.size) * 100;
      console.log(`Compression Ratio: ${compressionRatio.toFixed(2)}%`);
      setResultSize(formatFileSize(compressedPdf.size));
    } catch (error) {
      console.error('Error compressing PDF:', error);
      showSnackBar(
        `Failed to compress PDF: ${
          error instanceof Error ? error.message : String(error)
        }`,
        'error'
      );
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const compressionOptions: {
    value: CompressionLevel;
    label: string;
    description: string;
  }[] = [
    {
      value: 'low',
      label: 'Low Compression',
      description: 'Slightly reduce file size with minimal quality loss'
    },
    {
      value: 'medium',
      label: 'Medium Compression',
      description: 'Balance between file size and quality'
    },
    {
      value: 'high',
      label: 'High Compression',
      description: 'Maximum file size reduction with some quality loss'
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      setInput={setInput}
      initialValues={initialValues}
      compute={compute}
      exampleCards={exampleCards}
      inputComponent={
        <ToolPdfInput
          value={input}
          onChange={setInput}
          accept={['application/pdf']}
          title={'Input PDF'}
        />
      }
      resultComponent={
        <ToolFileResult
          title={'Compressed PDF'}
          value={result}
          extension={'pdf'}
          loading={isProcessing}
          loadingText={'Compressing PDF'}
        />
      }
      getGroups={({ values, updateField }) => [
        {
          title: 'Compression Settings',
          component: (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Compression Level
              </Typography>

              {compressionOptions.map((option) => (
                <SimpleRadio
                  key={option.value}
                  title={option.label}
                  description={option.description}
                  checked={values.compressionLevel === option.value}
                  onClick={() => {
                    updateField('compressionLevel', option.value);
                  }}
                />
              ))}

              {fileInfo && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2">
                    File size: <strong>{fileInfo.size}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Pages: <strong>{fileInfo.pages}</strong>
                  </Typography>
                  {resultSize && (
                    <Typography variant="body2">
                      Compressed file size: <strong>{resultSize}</strong>
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )
        }
      ]}
      toolInfo={{
        title: 'How to Use the Compress PDF Tool',
        description: `This tool allows you to compress PDF files securely in your browser using Ghostscript, a powerful PDF processing engine. Your files never leave your device, ensuring complete privacy and security.

Choose a compression level:
- Low Compression: Slightly reduces file size with minimal quality loss (72 dpi images)
- Medium Compression: Balances between file size and quality (150 dpi images) - Recommended for most cases
- High Compression: Maximum file size reduction with some quality loss (300 dpi images)

How it works:
1. Upload your PDF file
2. Select your desired compression level
3. Click "Compress" and wait for processing
4. Download your compressed PDF

The tool uses WebAssembly to run Ghostscript directly in your browser, which is why the first compression might take a moment to load the necessary components (about 18MB).

Note: The compression results may vary depending on the content of your PDF. Documents with many images will typically see greater size reduction than text-only documents.

${longDescription}`
      }}
    />
  );
}
