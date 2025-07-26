import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { useTranslation } from 'react-i18next';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { minifyCss, minifyJs } from './service';

const initialValues = {
  language: 'css' as 'css' | 'js'
};
type InitialValuesType = typeof initialValues;

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Minify CSS Example',
    description: 'This example shows how a simple CSS block is minified.',
    sampleText: `body {\n  margin: 0;\n  padding: 0;\n  background-color: white;\n}`,
    sampleResult: `body{margin:0;padding:0;background-color:white}`,
    sampleOptions: { language: 'css' }
  },
  {
    title: 'Minify JS Example',
    description: 'This example demonstrates JavaScript minification.',
    sampleText: `function hello(name) {\n  console.log("Hello, " + name);\n}`,
    sampleResult: `function hello(name){console.log("Hello,"+name)}`,
    sampleOptions: { language: 'js' }
  }
];

export default function CssJsMinify({ title }: ToolComponentProps) {
  const { t } = useTranslation('dev');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const compute = (values: InitialValuesType, input: string) => {
    const minified =
      values.language === 'css' ? minifyCss(input) : minifyJs(input);
    setResult(minified);
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('cssJsMinify.language'),
      component: (
        <Box mt={1}>
          <FormControl fullWidth>
            <InputLabel>{t('cssJsMinify.language')}</InputLabel>
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
        title: t('cssJsMinify.toolInfo.title'),
        description: t('cssJsMinify.toolInfo.description')
      }}
    />
  );
}
