import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { useTranslation } from 'react-i18next';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { unminifyCss, unminifyJs } from './service';

const initialValues = {
  language: 'css' as 'css' | 'js'
};
type InitialValuesType = typeof initialValues;

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Unminify CSS Example',
    description:
      'This example shows how a compressed CSS block is reformatted.',
    sampleText: `body{margin:0;padding:0}`,
    sampleResult: `body {\n  margin:0;\n  padding:0;\n}`,
    sampleOptions: { language: 'css' }
  },
  {
    title: 'Unminify JS Example',
    description: 'This example demonstrates JavaScript beautification.',
    sampleText: `function test(){console.log("Hello")}`,
    sampleResult: `function test() {\nconsole.log("Hello")\n}`,
    sampleOptions: { language: 'js' }
  }
];

export default function CssJsUnminify({ title }: ToolComponentProps) {
  const { t } = useTranslation('dev');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const compute = (values: InitialValuesType, input: string) => {
    const output =
      values.language === 'css' ? unminifyCss(input) : unminifyJs(input);
    setResult(output);
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('cssJsUnminify.language'),
      component: (
        <Box mt={1}>
          <FormControl fullWidth>
            <InputLabel>{t('cssJsUnminify.language')}</InputLabel>
            <Select
              value={values.language}
              onChange={(e) =>
                updateField('language', e.target.value as 'css' | 'js')
              }
            >
              <MenuItem value="css">CSS</MenuItem>
              <MenuItem value="js">JavaScript</MenuItem>
            </Select>
          </FormControl>
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
        title: t('cssJsUnminify.toolInfo.title'),
        description: t('cssJsUnminify.toolInfo.description')
      }}
    />
  );
}
