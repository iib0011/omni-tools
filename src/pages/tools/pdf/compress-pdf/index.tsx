import { Box, Typography } from '@mui/material';
import React, { useState, useEffect, useContext } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { compressPdf } from './service';
import { InitialValuesType, CompressionLevel } from './types';
import ToolPdfInput from '@components/input/ToolPdfInput';
import { GetGroupsType } from '@components/options/ToolOptions';
import ToolFileResult from '@components/result/ToolFileResult';
import SimpleRadio from '@components/options/SimpleRadio';
import { CardExampleType } from '@components/examples/ToolExamples';
import { PDFDocument } from 'pdf-lib';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  compressionLevel: 'low'
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Low Compression',
    description: 'Minimal quality loss with slight file size reduction',
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
  const { t } = useTranslation('pdf');
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
        showSnackBar(t('compressPdf.errorReadingPdf'), 'error');
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
        t('compressPdf.errorCompressingPdf', {
          error: error instanceof Error ? error.message : String(error)
        }),
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
      label: t('compressPdf.lowCompression'),
      description: t('compressPdf.lowCompressionDescription')
    },
    {
      value: 'medium',
      label: t('compressPdf.mediumCompression'),
      description: t('compressPdf.mediumCompressionDescription')
    },
    {
      value: 'high',
      label: t('compressPdf.highCompression'),
      description: t('compressPdf.highCompressionDescription')
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      setInput={setInput}
      initialValues={initialValues}
      compute={compute}
      inputComponent={
        <ToolPdfInput
          value={input}
          onChange={setInput}
          accept={['application/pdf']}
          title={t('compressPdf.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('compressPdf.resultTitle')}
          value={result}
          extension={'pdf'}
          loading={isProcessing}
          loadingText={t('compressPdf.compressingPdf')}
        />
      }
      getGroups={({ values, updateField }) => [
        {
          title: t('compressPdf.compressionSettings'),
          component: (
            <Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t('compressPdf.compressionLevel')}
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
              </Box>
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
                    {t('compressPdf.fileSize')}:{' '}
                    <strong>{fileInfo.size}</strong>
                  </Typography>
                  <Typography variant="body2">
                    {t('compressPdf.pages')}: <strong>{fileInfo.pages}</strong>
                  </Typography>
                  {resultSize && (
                    <Typography variant="body2">
                      {t('compressPdf.compressedFileSize')}:{' '}
                      <strong>{resultSize}</strong>
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )
        }
      ]}
    />
  );
}
