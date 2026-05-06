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

  const compute = async (
    _options: Record<string, never>,
    input: File | null
  ) => {
    if (!input) return;

    setIsProcessing(true);
    setResult([]);
    setZipFile(null);
    try {
      const returnedImages = await processPDF(input);
      setResult(returnedImages?.extractedImages ?? []);
      setZipFile(returnedImages?.zipFile ?? null);
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
          onChange={setInput}
          accept={['application/pdf']}
          title={t('extractImagesFromPdf.inputTitle')}
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
        title: t('extractImagesFromPdf.title'),
        description: t('extractImagesFromPdf.longDescription')
      }}
    />
  );
}
