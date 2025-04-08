import { Box } from '@mui/material';
import React, { useContext, useState } from 'react';
import * as Yup from 'yup';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import SelectWithDesc from '@components/options/SelectWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import CircularProgress from '@mui/material/CircularProgress';
import { extractTextFromImage, getAvailableLanguages } from './service';
import { InitialValuesType } from './types';
import { CustomSnackBarContext } from '../../../../../contexts/CustomSnackBarContext';

const initialValues: InitialValuesType = {
  language: 'eng',
  detectParagraphs: true
};

const validationSchema = Yup.object({
  language: Yup.string().required('Language is required')
});

export default function ImageToText({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const compute = async (optionsValues: InitialValuesType, input: any) => {
    if (!input) return;

    setIsProcessing(true);

    try {
      const extractedText = await extractTextFromImage(input, optionsValues);
      setResult(extractedText);
    } catch (err: any) {
      showSnackBar(
        err.message || 'An error occurred while processing the image',
        'error'
      );
      setResult('');
    } finally {
      setIsProcessing(false);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'OCR Options',
      component: (
        <Box>
          <SelectWithDesc
            selected={values.language}
            onChange={(val) => updateField('language', val)}
            description={
              'Select the primary language in the image for better accuracy'
            }
            options={getAvailableLanguages()}
          />
          <CheckboxWithDesc
            checked={values.detectParagraphs}
            onChange={(value) => updateField('detectParagraphs', value)}
            description={
              'Attempt to preserve paragraph structure in the extracted text'
            }
            title={'Detect Paragraphs'}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      input={input}
      validationSchema={validationSchema}
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/jpeg', 'image/png']}
          title={'Input Image'}
        />
      }
      resultComponent={
        <ToolTextResult
          title={'Extracted Text'}
          value={result}
          loading={isProcessing}
        />
      }
      toolInfo={{
        title: 'Image to Text (OCR)',
        description:
          'This tool extracts text from images using Optical Character Recognition (OCR). Upload an image containing text, select the primary language, and get the extracted text. For best results, use clear images with good contrast.'
      }}
    />
  );
}
