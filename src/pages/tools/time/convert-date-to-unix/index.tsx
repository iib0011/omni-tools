import { Box } from '@mui/material';
import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { convertToUnix } from './service';
import { useTranslation } from 'react-i18next';
import InitialValuesType from './types';
import { exampleCards } from './example';

const initialValues: InitialValuesType = {
  useLocalTime: false
};

export default function convertDateToUnix({ title }: ToolComponentProps) {
  const { t } = useTranslation('time');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    setResult(convertToUnix(input, values.useLocalTime));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('convertDateToUnix.options'),
      component: (
        <Box>
          <CheckboxWithDesc
            onChange={(val) => updateField('useLocalTime', val)}
            checked={values.useLocalTime}
            title={t('convertDateToUnix.useLocalTime')}
            description={t('convertDateToUnix.useLocalTimeDescription')}
          />
        </Box>
      )
    }
  ];
  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={<ToolTextInput value={input} onChange={setInput} />}
      resultComponent={<ToolTextResult value={result} />}
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('convertDateToUnix.toolInfo.title'),
        description: t('convertDateToUnix.toolInfo.description')
      }}
    />
  );
}
