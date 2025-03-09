import React, { useState } from 'react';
import { Box } from '@mui/material';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { stringQuoter } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';

interface InitialValuesType {
  leftQuote: string;
  rightQuote: string;
  doubleQuotation: boolean;
  emptyQuoting: boolean;
  multiLine: boolean;
}

const initialValues: InitialValuesType = {
  leftQuote: '"',
  rightQuote: '"',
  doubleQuotation: false,
  emptyQuoting: true,
  multiLine: true
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Quote text with double quotes',
    description: 'This example shows how to quote text with double quotes.',
    sampleText: 'Hello World',
    sampleResult: '"Hello World"',
    sampleOptions: {
      leftQuote: '"',
      rightQuote: '"',
      doubleQuotation: false,
      emptyQuoting: true,
      multiLine: false
    }
  },
  {
    title: 'Quote multi-line text with single quotes',
    description:
      'This example shows how to quote multi-line text with single quotes.',
    sampleText: 'Hello\nWorld',
    sampleResult: "'Hello'\n'World'",
    sampleOptions: {
      leftQuote: "'",
      rightQuote: "'",
      doubleQuotation: false,
      emptyQuoting: true,
      multiLine: true
    }
  },
  {
    title: 'Quote with custom quotes',
    description: 'This example shows how to quote text with custom quotes.',
    sampleText: 'Hello World',
    sampleResult: '<<Hello World>>',
    sampleOptions: {
      leftQuote: '<<',
      rightQuote: '>>',
      doubleQuotation: false,
      emptyQuoting: true,
      multiLine: false
    }
  }
];

export default function Quote({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    if (input) {
      setResult(
        stringQuoter(
          input,
          optionsValues.leftQuote,
          optionsValues.rightQuote,
          optionsValues.doubleQuotation,
          optionsValues.emptyQuoting,
          optionsValues.multiLine
        )
      );
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Quote Options',
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.leftQuote}
            onOwnChange={(val) => updateField('leftQuote', val)}
            description={'Left quote character(s)'}
          />
          <TextFieldWithDesc
            value={values.rightQuote}
            onOwnChange={(val) => updateField('rightQuote', val)}
            description={'Right quote character(s)'}
          />
          <CheckboxWithDesc
            checked={values.doubleQuotation}
            onChange={(checked) => updateField('doubleQuotation', checked)}
            title={'Allow double quotation'}
          />
          <CheckboxWithDesc
            checked={values.emptyQuoting}
            onChange={(checked) => updateField('emptyQuoting', checked)}
            title={'Quote empty lines'}
          />
          <CheckboxWithDesc
            checked={values.multiLine}
            onChange={(checked) => updateField('multiLine', checked)}
            title={'Process as multi-line text'}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolTextInput title="Input Text" value={input} onChange={setInput} />
      }
      resultComponent={<ToolTextResult title="Quoted Text" value={result} />}
      initialValues={initialValues}
      getGroups={getGroups}
      toolInfo={{
        title: 'Text Quoter',
        description:
          "This tool allows you to add quotes around text. You can choose different quote characters, handle multi-line text, and control how empty lines are processed. It's useful for preparing text for programming, formatting data, or creating stylized text."
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
