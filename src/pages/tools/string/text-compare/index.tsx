import { Box } from '@mui/material';
import { useState, useEffect } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolDiffResult from '@components/result/ToolDiffResult';
import SelectWithDesc from '@components/options/SelectWithDesc';
import { useTranslation } from 'react-i18next';
import { compareTextsHtml } from './service';
import { level, InitialValuesType } from './types';

const initialValues: InitialValuesType = {
  level: 'word'
};

export default function TextCompare({ title }: ToolComponentProps) {
  const { t } = useTranslation('string');
  const [inputA, setInputA] = useState<string>('');
  const [inputB, setInputB] = useState<string>('');
  const [level, setLevel] = useState<level>('word');
  const [result, setResult] = useState<string>('');

  const compute = () => {
    setResult(compareTextsHtml(inputA, inputB, level));
  };

  useEffect(() => {
    compute();
  }, [inputA, inputB, level]);

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('textCompare.options.title'),
      component: (
        <Box>
          <SelectWithDesc
            selected={values.level}
            options={[
              { label: t('textCompare.options.wordLevel'), value: 'word' },
              { label: t('textCompare.options.charLevel'), value: 'char' }
            ]}
            onChange={(value) => {
              updateField('level', value);
              setLevel(value);
            }}
            description={t('textCompare.options.levelDesc')}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={inputA}
      inputComponent={
        <Box display="flex" flexDirection="column" gap={2}>
          <ToolTextInput
            value={inputA}
            onChange={setInputA}
            title={t('textCompare.inputTitle')}
          />
          <ToolTextInput
            value={inputB}
            onChange={setInputB}
            title={t('textCompare.inputTitle')}
          />
        </Box>
      }
      resultComponent={
        <ToolDiffResult
          value={result}
          title={t('textCompare.resultTitle')}
          isHtml
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={() => {
        setInputA('');
        setInputB('');
        setResult('');
      }}
      compute={compute}
      toolInfo={{
        title: t('textCompare.title'),
        description: t('textCompare.longDescription')
      }}
    />
  );
}
