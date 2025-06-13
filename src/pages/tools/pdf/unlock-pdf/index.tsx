import React, { useContext, useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolPdfInput from '@components/input/ToolPdfInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { InitialValuesType, Speed } from './types';
import { unlockPdf } from './service';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import RadioWithTextField from '@components/options/RadioWithTextField';
import SimpleRadio from '@components/options/SimpleRadio';

const initialValues: InitialValuesType = {
  speed: 'normal'
};

const speeds: {
  label: string;
  description: string;
  value: Speed;
}[] = [
  {
    label: 'Slow',
    value: 'slow',
    description: 'More probable to unlock the PDF, but may take longer.'
  },
  {
    label: 'Normal',
    value: 'normal',
    description: 'Balanced between speed and success rate.'
  },
  {
    label: 'Fast',
    value: 'fast',
    description:
      'Faster unlocking, but less thorough; may fail on complex passwords.'
  }
];

export default function UnlockPdf({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) return;

    try {
      setIsProcessing(true);
      const protectedPdf = await unlockPdf(input, values);
      setResult(protectedPdf);
    } catch (error) {
      console.error('Error protecting PDF:', error);
      showSnackBar(
        `Failed to protect PDF: ${
          error instanceof Error ? error.message : String(error)
        }`,
        'error'
      );
      setResult(null);
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
          title={'Unlocked PDF'}
          value={result}
          extension={'pdf'}
          loading={isProcessing}
          loadingText={'Unlocking PDF'}
        />
      }
      getGroups={({ values, updateField }) => [
        {
          title: 'Speed',
          component: speeds.map(({ label, description, value }) => (
            <SimpleRadio
              key={value}
              checked={value === values.speed}
              title={label}
              description={description}
              onClick={() => updateField('speed', value)}
            />
          ))
        }
      ]}
    />
  );
}
