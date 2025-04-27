import { Box, FormControlLabel, Switch, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolPdfInput from '@components/input/ToolPdfInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import { PDFDocument } from 'pdf-lib';
import { InitialValuesType, RotationAngle } from './types';
import { parsePageRanges, rotatePdf } from './service';
import SimpleRadio from '@components/options/SimpleRadio';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { isArray } from 'lodash';

const initialValues: InitialValuesType = {
  rotationAngle: 90,
  applyToAllPages: true,
  pageRanges: ''
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Rotate All Pages 90°',
    description: 'Rotate all pages in the document 90 degrees clockwise',
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
    description: 'Rotate only pages 1 and 3 by 180 degrees',
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
        totalPages > 0 ? `All ${totalPages} pages will be rotated` : ''
      );
      return;
    }

    if (!totalPages || !pageRanges?.trim()) {
      setPageRangePreview('');
      return;
    }

    try {
      const count = parsePageRanges(pageRanges, totalPages).length;
      setPageRangePreview(
        `${count} page${count !== 1 ? 's' : ''} will be rotated`
      );
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
    { value: 90, label: '90° Clockwise' },
    { value: 180, label: '180° (Upside down)' },
    { value: 270, label: '270° (90° Counter-clockwise)' }
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
          onChange={(v) => {
            setInput(isArray(v) ? v[0] : v);
          }}
          accept={['application/pdf']}
          title={'Input PDF'}
        />
      }
      resultComponent={
        <ToolFileResult
          title={'Rotated PDF'}
          value={result}
          extension={'pdf'}
          loading={isProcessing}
          loadingText={'Rotating pages'}
        />
      }
      getGroups={({ values, updateField }) => [
        {
          title: 'Rotation Settings',
          component: (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Rotation Angle
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
                  label="Apply to all pages"
                />
              </Box>

              {!values.applyToAllPages && (
                <Box sx={{ mt: 2 }}>
                  {totalPages > 0 && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      PDF has {totalPages} page{totalPages !== 1 ? 's' : ''}
                    </Typography>
                  )}
                  <TextFieldWithDesc
                    value={values.pageRanges}
                    onOwnChange={(val) => {
                      updateField('pageRanges', val);
                    }}
                    description={
                      'Enter page numbers or ranges separated by commas (e.g., 1,3,5-7)'
                    }
                    placeholder={'e.g., 1,5-8'}
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
        title: 'How to Use the Rotate PDF Tool',
        description: `This tool allows you to rotate pages in a PDF document. You can rotate all pages or specify individual pages to rotate.

Choose a rotation angle:
- 90° Clockwise
- 180° (Upside down)
- 270° (90° Counter-clockwise)

To rotate specific pages:
1. Uncheck "Apply to all pages"
2. Enter page numbers or ranges separated by commas (e.g., 1,3,5-7)

Examples:
- "1,5,9" rotates pages 1, 5, and 9
- "1-5" rotates pages 1 through 5
- "1,3-5,8-10" rotates pages 1, 3, 4, 5, 8, 9, and 10

${longDescription}`
      }}
    />
  );
}
