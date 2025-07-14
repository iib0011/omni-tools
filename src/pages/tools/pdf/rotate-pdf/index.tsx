import { Box, Typography, FormControlLabel, Switch } from '@mui/material';
import { useEffect, useState } from 'react';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { parsePageRanges, rotatePdf } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { PDFDocument } from 'pdf-lib';
import ToolPdfInput from '@components/input/ToolPdfInput';
import SimpleRadio from '@components/options/SimpleRadio';
import { InitialValuesType, RotationAngle } from './types';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  rotationAngle: 90,
  applyToAllPages: true,
  pageRanges: ''
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Rotate All Pages 90°',
    description: 'Rotate all pages in the PDF by 90 degrees clockwise',
    sampleText: '',
    sampleResult: '',
    sampleOptions: {
      rotationAngle: 90,
      applyToAllPages: true,
      pageRanges: ''
    }
  },
  {
    title: 'Rotate Specific Pages 180°',
    description: 'Rotate pages 1 and 3 by 180 degrees',
    sampleText: '',
    sampleResult: '',
    sampleOptions: {
      rotationAngle: 180,
      applyToAllPages: false,
      pageRanges: '1,3'
    }
  },
  {
    title: 'Rotate Page Range 270°',
    description: 'Rotate pages 2 through 5 by 270 degrees',
    sampleText: '',
    sampleResult: '',
    sampleOptions: {
      rotationAngle: 270,
      applyToAllPages: false,
      pageRanges: '2-5'
    }
  }
];

export default function RotatePdf({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('pdf');
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
    const { pageRanges, applyToAllPages } = values;

    if (applyToAllPages) {
      setPageRangePreview(
        totalPages > 0
          ? t('rotatePdf.allPagesWillBeRotated', { count: totalPages })
          : ''
      );
      return;
    }

    if (!totalPages || !pageRanges?.trim()) {
      setPageRangePreview('');
      return;
    }

    try {
      const count = parsePageRanges(pageRanges, totalPages).length;
      setPageRangePreview(t('rotatePdf.pagesWillBeRotated', { count }));
    } catch (error) {
      setPageRangePreview('');
    }
  };

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) return;

    try {
      setIsProcessing(true);
      const rotatedPdf = await rotatePdf(input, values);
      setResult(rotatedPdf);
    } catch (error) {
      throw new Error('Error rotating PDF: ' + error);
    } finally {
      setIsProcessing(false);
    }
  };
  const angleOptions: { value: RotationAngle; label: string }[] = [
    { value: 90, label: t('rotatePdf.angleOptions.clockwise90') },
    { value: 180, label: t('rotatePdf.angleOptions.upsideDown180') },
    { value: 270, label: t('rotatePdf.angleOptions.counterClockwise270') }
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
          title={t('rotatePdf.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('rotatePdf.resultTitle')}
          value={result}
          extension={'pdf'}
          loading={isProcessing}
          loadingText={t('rotatePdf.rotatingPages')}
        />
      }
      getGroups={({ values, updateField }) => [
        {
          title: t('rotatePdf.rotationSettings'),
          component: (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('rotatePdf.rotationAngle')}
              </Typography>
              {angleOptions.map((angleOption) => (
                <SimpleRadio
                  key={angleOption.value}
                  title={angleOption.label}
                  checked={values.rotationAngle === angleOption.value}
                  onClick={() => {
                    updateField('rotationAngle', angleOption.value);
                  }}
                />
              ))}

              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.applyToAllPages}
                      onChange={(e) => {
                        updateField('applyToAllPages', e.target.checked);
                      }}
                    />
                  }
                  label={t('rotatePdf.applyToAllPages')}
                />
              </Box>

              {!values.applyToAllPages && (
                <Box sx={{ mt: 2 }}>
                  {totalPages > 0 && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {t('rotatePdf.pdfPageCount', { count: totalPages })}
                    </Typography>
                  )}
                  <TextFieldWithDesc
                    value={values.pageRanges}
                    onOwnChange={(val) => {
                      updateField('pageRanges', val);
                    }}
                    description={t('rotatePdf.pageRangesDescription')}
                    placeholder={t('rotatePdf.pageRangesPlaceholder')}
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
              )}
            </Box>
          )
        }
      ]}
      onValuesChange={onValuesChange}
      toolInfo={{
        title: t('rotatePdf.toolInfo.title'),
        description: t('rotatePdf.toolInfo.description')
      }}
    />
  );
}
