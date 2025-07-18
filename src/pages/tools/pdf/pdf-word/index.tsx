import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolPdfInput from '@components/input/ToolPdfInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { GetGroupsType } from '@components/options/ToolOptions';

import { convertPdfToWord } from './service';

export default function PdfWord({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const compute = async (values: {}, input: File | null) => {
    if (!input) return;
    try {
      setIsProcessing(true);
      setResult(null);
      const wordFile = await convertPdfToWord(input);
      setResult(wordFile);
    } catch (error) {
      console.error('PDF to Word conversion failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getGroups: GetGroupsType<{}> | null = null;

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolPdfInput
          value={input}
          onChange={(file) => setInput(file)}
          accept={['application/pdf']}
          title={'Input PDF'}
        />
      }
      resultComponent={
        <ToolFileResult
          title={'Word Output'}
          value={result}
          extension={'docx'}
          loading={isProcessing}
          loadingText={'Converting PDF to Word...'}
        />
      }
      initialValues={{}}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: `PDF to Word`,
        description: `Convert PDF files to Word documents for easy editing and formatting`
      }}
    />
  );
}
