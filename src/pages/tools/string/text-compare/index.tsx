import { Box } from '@mui/material';
import { useState, useEffect } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolDiffResult from '@components/result/ToolDiffResult';
import { useTranslation } from 'react-i18next';
import { compareTextsHtml } from './service';

export default function TextCompare({ title }: ToolComponentProps) {
  const { t } = useTranslation('string');
  const [inputA, setInputA] = useState<string>('');
  const [inputB, setInputB] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = () => {
    setResult(compareTextsHtml(inputA, inputB));
  };

  useEffect(() => {
    compute();
  }, [inputA, inputB]);

  return (
    <ToolContent
      title={title}
      input={inputA}
      inputComponent={
        <Box display="flex" flexDirection="column" gap={2}>
          <ToolTextInput value={inputA} onChange={setInputA} />
          <ToolTextInput value={inputB} onChange={setInputB} />
        </Box>
      }
      resultComponent={<ToolDiffResult value={result} isHtml />}
      initialValues={{}}
      getGroups={null}
      setInput={() => {
        setInputA('');
        setInputB('');
        setResult('');
      }}
      compute={compute}
      toolInfo={{
        title: t('textCompare.toolInfo.title'),
        description: t('textCompare.toolInfo.description')
      }}
    />
  );
}
