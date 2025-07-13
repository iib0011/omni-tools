import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { parsePageRanges, splitPdf } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { PDFDocument } from 'pdf-lib';
import ToolPdfInput from '@components/input/ToolPdfInput';
import { useTranslation } from 'react-i18next';

type InitialValuesType = {
  pageRanges: string;
};

const initialValues: InitialValuesType = {
  pageRanges: ''
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Extract Specific Pages',
    description: 'Extract pages 1, 5, 6, 7, and 8 from a PDF document.',
    sampleText: '',
    sampleResult: '',
    sampleOptions: {
      pageRanges: '1,5-8'
    }
  },
  {
    title: 'Extract First and Last Pages',
    description: 'Extract only the first and last pages from a PDF document.',
    sampleText: '',
    sampleResult: '',
    sampleOptions: {
      pageRanges: '1,10'
    }
  },
  {
    title: 'Extract a Range of Pages',
    description: 'Extract a continuous range of pages from a PDF document.',
    sampleText: '',
    sampleResult: '',
    sampleOptions: {
      pageRanges: '3-7'
    }
  }
];

export default function SplitPdf({ title }: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [pageRangePreview, setPageRangePreview] = useState<string>('');

  // Get the total number of pages when a PDF is uploaded
  useEffect(() => {
    const getPdfInfo = async () => {
      if (!input) {
        setTotalPages(0);
        return;
      }

      try {
        const arrayBuffer = await input.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        setTotalPages(pdf.getPageCount());
      } catch (error) {
        console.error('Error getting PDF info:', error);
        setTotalPages(0);
      }
    };

    getPdfInfo();
  }, [input]);

  const onValuesChange = (values: InitialValuesType) => {
    const { pageRanges } = values;
    if (!totalPages || !pageRanges?.trim()) {
      setPageRangePreview('');
      return;
    }
    try {
      const count = parsePageRanges(pageRanges, totalPages).length;
      setPageRangePreview(t('pdf:splitPdf.pageExtractionPreview', { count }));
    } catch (error) {
      setPageRangePreview('');
    }
  };

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) return;

    try {
      setIsProcessing(true);
      const splitResult = await splitPdf(input, values.pageRanges);
      setResult(splitResult);
    } catch (error) {
      throw new Error('Error splitting PDF:' + error);
    } finally {
      setIsProcessing(false);
    }
  };

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
          title={t('pdf:splitPdf.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('pdf:splitPdf.resultTitle')}
          value={result}
          extension={'pdf'}
          loading={isProcessing}
          loadingText={t('pdf:splitPdf.extractingPages')}
        />
      }
      getGroups={({ values, updateField }) => [
        {
          title: t('pdf:splitPdf.pageSelection'),
          component: (
            <Box>
              {totalPages > 0 && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {t('pdf:splitPdf.pdfPageCount', { count: totalPages })}
                </Typography>
              )}
              <TextFieldWithDesc
                value={values.pageRanges}
                onOwnChange={(val) => {
                  updateField('pageRanges', val);
                }}
                description={t('pdf:splitPdf.pageRangesDescription')}
                placeholder={t('pdf:splitPdf.pageRangesPlaceholder')}
              />
              {pageRangePreview && (
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: 'primary.main' }}
                >
                  {pageRangePreview}
                </Typography>
              )}
            </Box>
          )
        }
      ]}
      onValuesChange={onValuesChange}
      toolInfo={{
        title: t('pdf:splitPdf.toolInfo.title'),
        description: t('pdf:splitPdf.toolInfo.description')
      }}
    />
  );
}
