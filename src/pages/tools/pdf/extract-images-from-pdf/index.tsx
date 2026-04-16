import { useState } from 'react';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolPdfInput from '@components/input/ToolPdfInput';
import { processPDF } from './service';
import ToolMultiFileResult from '@components/result/ToolMultiFileResult';
import { useTranslation } from 'react-i18next';

export default function PdfToEpub({ title }: ToolComponentProps) {
  const { t } = useTranslation('pdf');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const compute = async (options: {}, input: File | null) => {
    if (!input) return;
    try {
      setIsProcessing(true);
      setResult([]);
      const returnedImages = await processPDF(input);

      // No result
      if (!returnedImages) {
        setResult([]);
        setZipFile(null);
      } else {
        setResult(returnedImages.extractedImages);
        setZipFile(returnedImages.zipFile);
      }
    } catch (error) {
      console.error('Failed to extract images from PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolContent
      title={title}
      input={input}
      setInput={setInput}
      initialValues={{}}
      compute={compute}
      inputComponent={
        <ToolPdfInput
          value={input}
          onChange={(file) => setInput(file)}
          accept={['application/pdf']}
          title={'Input PDF'}
        />
      }
      getGroups={null}
      resultComponent={
        zipFile ? (
          <ToolMultiFileResult
            title={t('extractImagesFromPdf.resultTitle')}
            value={result}
            zipFile={zipFile}
            loading={isProcessing}
          />
        ) : (
          <ToolFileResult
            title={t('extractImagesFromPdf.resultTitle')}
            value={result[0] ?? null}
            extension={'png'}
            loading={isProcessing}
          />
        )
      }
      toolInfo={{
        title: 'How to Extract Images from PDF File?',
        description: `Upload a PDF file and this tool will extract its images for you to download.`
      }}
    />
  );
}
