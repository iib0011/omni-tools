import { Box } from '@mui/material';
import React, { useRef, useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import ToolOptions, { GetGroupsType } from '@components/options/ToolOptions';
import { compute, SplitOperatorType } from './service';
import RadioWithTextField from '@components/options/RadioWithTextField';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolInputAndResult from '@components/ToolInputAndResult';
import ToolExamples, {
  CardExampleType
} from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { FormikProps } from 'formik';

const initialValues = {
  splitSeparatorType: 'symbol' as SplitOperatorType,
  symbolValue: ' ',
  regexValue: '/\\s+/',
  lengthValue: '16',
  chunksValue: '4',

  outputSeparator: '\\n',
  charBeforeChunk: '',
  charAfterChunk: ''
};
const splitOperators: {
  title: string;
  description: string;
  type: SplitOperatorType;
}[] = [
  {
    title: 'Use a Symbol for Splitting',
    description:
      'Character that will be used to\n' +
      'break text into parts.\n' +
      '(Space by default.)',
    type: 'symbol'
  },
  {
    title: 'Use a Regex for Splitting',
    type: 'regex',
    description:
      'Regular expression that will be\n' +
      'used to break text into parts.\n' +
      '(Multiple spaces by default.)'
  },
  {
    title: 'Use Length for Splitting',
    description:
      'Number of symbols that will be\n' + 'put in each output chunk.',
    type: 'length'
  },
  {
    title: 'Use a Number of Chunks',
    description: 'Number of chunks of equal\n' + 'length in the output.',
    type: 'chunks'
  }
];
const outputOptions: {
  description: string;
  accessor: keyof typeof initialValues;
}[] = [
  {
    description:
      'Character that will be put\n' +
      'between the split chunks.\n' +
      '(It\'s newline "\\n" by default.)',
    accessor: 'outputSeparator'
  },
  {
    description: 'Character before each chunk',
    accessor: 'charBeforeChunk'
  },
  {
    description: 'Character after each chunk',
    accessor: 'charAfterChunk'
  }
];

const exampleCards: CardExampleType<typeof initialValues>[] = [
  {
    title: 'Split German Numbers',
    description:
      'In this example, we break the text into pieces by two characters – a comma and space. As a result, we get a column of numbers from 1 to 10 in German.',
    sampleText: `1 - eins, 2 - zwei, 3 - drei, 4 - vier, 5 - fünf, 6 - sechs, 7 - sieben, 8 - acht, 9 - neun, 10 - zehn`,
    sampleResult: `1 - eins
2 - zwei
3 - drei
4 - vier
5 - fünf
6 - sechs
7 - sieben
8 - acht
9 - neun
10 - zehn`,
    sampleOptions: {
      ...initialValues,
      symbolValue: ',',
      splitSeparatorType: 'symbol',
      outputSeparator: '\n'
    }
  },
  {
    title: 'Text Cleanup via a Regular Expression',
    description:
      'In this example, we use a super smart regular expression trick to clean-up the text. This regexp finds all non-alphabetic characters and splits the text into pieces by these non-alphabetic chars. As a result, we extract only those parts of the text that contain Latin letters and words.',
    sampleText: `Finding%№1.65*;?words()is'12#easy_`,
    sampleResult: `Finding
words
is
easy`,
    sampleOptions: {
      ...initialValues,
      regexValue: '[^a-zA-Z]+',
      splitSeparatorType: 'regex',
      outputSeparator: '\n'
    }
  },
  {
    title: 'Three-dot Output Separator',
    description:
      'This example splits the text by spaces and then places three dots between the words.',
    sampleText: `If you started with $0.01 and doubled your money every day, it would take 27 days to become a millionaire.`,
    sampleResult: `If...you...started...with...$0.01...and...doubled...your...money...every...day,...it...would...take...27...days...to...become...a...millionaire.!`,
    sampleOptions: {
      ...initialValues,
      symbolValue: '',
      splitSeparatorType: 'symbol',
      outputSeparator: '...'
    }
  }
];

export default function SplitText({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const formRef = useRef<FormikProps<typeof initialValues>>(null);
  const computeExternal = (optionsValues: typeof initialValues, input: any) => {
    const {
      splitSeparatorType,
      outputSeparator,
      charBeforeChunk,
      charAfterChunk,
      chunksValue,
      symbolValue,
      regexValue,
      lengthValue
    } = optionsValues;

    setResult(
      compute(
        splitSeparatorType,
        input,
        symbolValue,
        regexValue,
        Number(lengthValue),
        Number(chunksValue),
        charBeforeChunk,
        charAfterChunk,
        outputSeparator
      )
    );
  };

  const getGroups: GetGroupsType<typeof initialValues> = ({
    values,
    updateField
  }) => [
    {
      title: 'Split separator options',
      component: splitOperators.map(({ title, description, type }) => (
        <RadioWithTextField
          key={type}
          checked={type === values.splitSeparatorType}
          title={title}
          fieldName={'splitSeparatorType'}
          description={description}
          value={values[`${type}Value`]}
          onRadioClick={() => updateField('splitSeparatorType', type)}
          onTextChange={(val) => updateField(`${type}Value`, val)}
        />
      ))
    },
    {
      title: 'Output separator options',
      component: outputOptions.map((option) => (
        <TextFieldWithDesc
          key={option.accessor}
          value={values[option.accessor]}
          onOwnChange={(value) => updateField(option.accessor, value)}
          description={option.description}
        />
      ))
    }
  ];
  return (
    <Box>
      <ToolInputAndResult
        input={<ToolTextInput value={input} onChange={setInput} />}
        result={<ToolTextResult title={'Text pieces'} value={result} />}
      />
      <ToolOptions
        compute={computeExternal}
        getGroups={getGroups}
        initialValues={initialValues}
        input={input}
      />
      <ToolExamples
        title={title}
        exampleCards={exampleCards}
        getGroups={getGroups}
        formRef={formRef}
      />
    </Box>
  );
}
