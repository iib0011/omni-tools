import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { checkLeapYear } from './service';

const initialValues = {};

type InitialValuesType = typeof initialValues;

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Find Birthdays on February 29',
    description:
      "One of our friends was born on a leap year on February 29th and as a consequence, she has a birthday only once every 4 years. As we can never really remember when her birthday is, we are using our program to create a reminder list of the upcoming leap years. To create a list of her next birthdays, we load a sequence of years from 2025 to 2040 into the input and get the status of each year. If the program says that it's a leap year, then we know that we'll be invited to a birthday party on February 29th.",
    sampleText: `2025
2026
2027
2028
2029
2030
2031
2032
2033
2034
2035
2036
2037
2038
2039
2040`,
    sampleResult: `2025 is not a leap year.
2026 is not a leap year.
2027 is not a leap year.
2028 is a leap year.
2029 is not a leap year.
2030 is not a leap year.
2031 is not a leap year.
2032 is a leap year.
2033 is not a leap year.
2034 is not a leap year.
2035 is not a leap year.
2036 is a leap year.
2037 is not a leap year.
2038 is not a leap year.
2039 is not a leap year.
2040 is a leap year.`,
    sampleOptions: {}
  }
];

export default function ConvertDaysToHours({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: typeof initialValues, input: string) => {
    setResult(checkLeapYear(input));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = () => [];

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={<ToolTextInput value={input} onChange={setInput} />}
      resultComponent={<ToolTextResult value={result} />}
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
      exampleCards={exampleCards}
    />
  );
}
