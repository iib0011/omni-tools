import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import ToolOptions from '@components/options/ToolOptions';
import { compute, NumberExtractionType } from './service';
import RadioWithTextField from '@components/options/RadioWithTextField';
import SimpleRadio from '@components/options/SimpleRadio';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import ToolInputAndResult from '@components/ToolInputAndResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import ToolInfo from '@components/ToolInfo';

const initialValues = {
  extractionType: 'smart' as NumberExtractionType,
  separator: '\\n',
  printRunningSum: false
};
type InitialValuesType = typeof initialValues;
const extractionTypes: {
  title: string;
  description: string;
  type: NumberExtractionType;
  withTextField: boolean;
  textValueAccessor?: keyof typeof initialValues;
}[] = [
  {
    title: 'Smart sum',
    description: 'Auto detect numbers in the input.',
    type: 'smart',
    withTextField: false
  },
  {
    title: 'Number Delimiter',
    type: 'delimiter',
    description:
      'Input SeparatorCustomize the number separator here. (By default a line break.)',
    withTextField: true,
    textValueAccessor: 'separator'
  }
];

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Sum of Ten Positive Numbers',
    description:
      "In this example, we calculate the sum of ten positive integers. These integers are listed as a column and their total sum equals 19494.",
    sampleText: `0
1
20
33
400
505
660
777
8008
9090`,
    sampleResult: `19494`,
    sampleOptions: {
      extractionType: 'delimiter',
      separator: '\\n',
      printRunningSum: false
    }
  },
  {
    title: 'Count Trees in the Park',
    description:
      'This example reverses a column of twenty three-syllable nouns and prints all the words from the bottom to top. To separate the list items, it uses the \n character as input item separator, which means that each item is on its own line..',
    sampleText: `This year gardeners have planted 20 red maples, 35 sweetgum, 13 quaking aspen, and 7 white oaks in the central park of the city.`,
    sampleResult: `75`,
    sampleOptions: {
      extractionType: 'smart',
      separator: '\\n',
      printRunningSum: false
    }
  },
  {
    title: 'Sum of Integers and Decimals',
    description:
      'In this example, we add together ninety different values – positive numbers, negative numbers, integers and decimal fractions. We set the input separator to a comma and after adding all of them together, we get 0 as output.',
    sampleText: `1, 2, 3, 4, 5, 6, 7, 8, 9, -1.1, -2.1, -3.1, -4.1, -5.1, -6.1, -7.1, -8.1, -9.1, 10, 20, 30, 40, 50, 60, 70, 80, 90, -10.2, -20.2, -30.2, -40.2, -50.2, -60.2, -70.2, -80.2, -90.2, 100, 200, 300, 400, 500, 600, 700, 800, 900, -100.3, -200.3, -300.3, -400.3, -500.3, -600.3, -700.3, -800.3, -900.3, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, -1000.4, -2000.4, -3000.4, -4000.4, -5000.4, -6000.4, -7000.4, -8000.4, -9000.4, 10001, 20001, 30001, 40001, 50001, 60001, 70001, 80001, 90001, -10000, -20000, -30000, -40000, -50000, -60000, -70000, -80000, -90000`,
    sampleResult: `0`,
    sampleOptions: {
      extractionType: 'delimiter',
      separator: ', ',
      printRunningSum: false
    }
  },
  {
    title: 'Running Sum of Numbers',
    description:
      'In this example, we calculate the sum of all ten digits and enable the option "Print Running Sum". We get the intermediate values of the sum in the process of addition. Thus, we have the following sequence in the output: 0, 1 (0 + 1), 3 (0 + 1 + 2), 6 (0 + 1 + 2 + 3), 10 (0 + 1 + 2 + 3 + 4), and so on.',
    sampleText: `0
1
2
3
4
5
6
7
8
9`,
    sampleResult: `0
1
3
6
10
15
21
28
36
45`,
    sampleOptions: {
      extractionType: 'delimiter',
      separator: '\\n',
      printRunningSum: true
    }
  }
];


export default function SplitText() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  return (
    <Box>
      <ToolInputAndResult
        input={<ToolTextInput value={input} onChange={setInput} />}
        result={<ToolTextResult title={'Total'} value={result} />}
      />
      <ToolOptions
        getGroups={({ values, updateField }) => [
          {
            title: 'Number extraction',
            component: extractionTypes.map(
              ({
                title,
                description,
                type,
                withTextField,
                textValueAccessor
              }) =>
                withTextField ? (
                  <RadioWithTextField
                    key={type}
                    checked={type === values.extractionType}
                    title={title}
                    fieldName={'extractionType'}
                    description={description}
                    value={
                      textValueAccessor
                        ? values[textValueAccessor].toString()
                        : ''
                    }
                    onRadioClick={() => updateField('extractionType', type)}
                    onTextChange={(val) =>
                      textValueAccessor
                        ? updateField(textValueAccessor, val)
                        : null
                    }
                  />
                ) : (
                  <SimpleRadio
                    key={title}
                    onClick={() => updateField('extractionType', type)}
                    checked={values.extractionType === type}
                    description={description}
                    title={title}
                  />
                )
            )
          },
          {
            title: 'Running Sum',
            component: (
              <CheckboxWithDesc
                title={'Print Running Sum'}
                description={"Display the sum as it's calculated step by step."}
                checked={values.printRunningSum}
                onChange={(value) => updateField('printRunningSum', value)}
              />
            )
          }
        ]}
        compute={(optionsValues, input) => {
          const { extractionType, printRunningSum, separator } = optionsValues;
          setResult(compute(input, extractionType, printRunningSum, separator));
        }}
        initialValues={initialValues}
        input={input}
      />
        <ToolInfo
            title="What Is a Number Sum Calculator?"
            description="This is an online browser-based utility for calculating the sum of a bunch of numbers. You can enter the numbers separated by a comma, space, or any other character, including the line break. You can also simply paste a fragment of textual data that contains numerical values that you want to sum up and the utility will extract them and find their sum."
          />
    </Box>
  );
}
