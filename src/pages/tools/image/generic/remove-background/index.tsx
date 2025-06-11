import React, { useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolImageInput from '@components/input/ToolImageInput';
import { removeBackground } from '@imgly/background-removal';

const initialValues = {};

const validationSchema = Yup.object({});

export default function RemoveBackgroundFromImage({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const compute = async (_optionsValues: typeof initialValues, input: any) => {
    if (!input) return;

    setIsProcessing(true);

    try {
      // Convert the input file to a Blob URL
      const inputUrl = URL.createObjectURL(input);

      // Process the image with the background removal library
      const blob = await removeBackground(inputUrl, {
        progress: (progress) => {
          console.log(`Background removal progress: ${progress}`);
        }
      });

      // Create a new file from the blob
      const newFile = new File(
        [blob],
        input.name.replace(/\.[^/.]+$/, '') + '-no-bg.png',
        {
          type: 'image/png'
        }
      );

      setResult(newFile);
    } catch (err) {
      console.error('Error removing background:', err);
      throw new Error(
        'Failed to remove background. Please try a different image or try again later.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={null}
      compute={compute}
      input={input}
      validationSchema={validationSchema}
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/*']}
          title={'Input Image'}
        />
      }
      resultComponent={
        <ToolFileResult
          title={'Transparent PNG'}
          value={result}
          extension={'png'}
          loading={isProcessing}
          loadingText={'Removing background'}
        />
      }
      toolInfo={{ title: title, description: longDescription }}
    />
  );
}
