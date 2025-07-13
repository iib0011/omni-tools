import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { reverseList, SplitOperatorType } from './service';
import SimpleRadio from '@components/options/SimpleRadio';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import ToolContent from '@components/ToolContent';
import { useTranslation } from 'react-i18next';

const initialValues = {
  splitOperatorType: 'symbol' as SplitOperatorType,
  splitSeparator: ',',
  joinSeparator: '\\n'
};
type InitialValuesType = typeof initialValues;
const splitOperators: {
  title: string;
  description: string;
  type: SplitOperatorType;
}[] = [
  {
    title: 'Use a Symbol for Splitting',
    description: 'Delimit input list items with a character.',
    type: 'symbol'
  },
  {
    title: 'Use a Regex for Splitting',
    type: 'regex',
    description: 'Delimit input list items with a regular expression.'
  }
];

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Reverse a List of Digits',
    description:
      'In this example, we load a list of digits in the input. The digits are separated by a mix of dot, comma, and semicolon characters, so we use the regular expression split mode and enter a regular expression that matches all these characters as the input item separator. In the output, we get a reversed list of digits that all use the semicolon as a separator.',
    sampleText: `2, 9, 6; 3; 7. 4. 4. 2, 1; 4, 8. 4; 4. 8, 2, 5; 1; 7; 7. 0`,
    sampleResult: `0; 7; 7; 1; 5; 2; 8; 4; 4; 8; 4; 1; 2; 4; 4; 7; 3; 6; 9; 2`,
    sampleOptions: {
      splitOperatorType: 'regex',
      splitSeparator: '[;,.]\\s*',
      joinSeparator: '; '
    }
  },
  {
    title: 'Reverse a Column of Words',
    description:
      'This example reverses a column of twenty three-syllable nouns and prints all the words from the bottom to top. To separate the list items, it uses the \n character as input item separator, which means that each item is on its own line..',
    sampleText: `argument
pollution
emphasis
vehicle
family
property
preference
studio
suggestion
accident
analyst
permission
reaction
promotion
quantity
inspection
chemistry
conclusion
confusion
memory`,
    sampleResult: `memory
confusion
conclusion
chemistry
inspection
quantity
promotion
reaction
permission
analyst
accident
suggestion
studio
preference
property
family
vehicle
emphasis
pollution
argument`,
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: '\\n',
      joinSeparator: '\\n'
    }
  },
  {
    title: 'Reverse a Random List',
    description:
      'In this example, the list elements are random cities, zip codes, and weather conditions. To reverse list elements, we first need to identify them and separate them apart. The input list incorrectly uses the dash symbol to separate the elements but the output list fixes this and uses commas.',
    sampleText: `Hamburg-21334-Dhaka-Sunny-Managua-Rainy-Chongqing-95123-Oakland`,
    sampleResult: `Oakland, 95123, Chongqing, Rainy, Managua, Sunny, Dhaka, 21334, Hamburg`,
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: '-',
      joinSeparator: ', '
    }
  }
];

export default function Reverse({ title }: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('list:reverse.splitterMode'),
      component: (
        <Box>
          {splitOperators.map(({ title, description, type }) => (
            <SimpleRadio
              key={type}
              onClick={() => updateField('splitOperatorType', type)}
              title={t(`list.reverse.splitOperators.${type}.title`)}
              description={t(`list.reverse.splitOperators.${type}.description`)}
              checked={values.splitOperatorType === type}
            />
          ))}
        </Box>
      )
    },
    {
      title: t('list:reverse.itemSeparator'),
      component: (
        <Box>
          <TextFieldWithDesc
            description={t('list:reverse.itemSeparatorDescription')}
            value={values.splitSeparator}
            onOwnChange={(val) => updateField('splitSeparator', val)}
          />
        </Box>
      )
    },
    {
      title: t('list:reverse.outputListOptions'),
      component: (
        <Box>
          <TextFieldWithDesc
            description={t('list:reverse.outputSeparatorDescription')}
            value={values.joinSeparator}
            onOwnChange={(val) => updateField('joinSeparator', val)}
          />
        </Box>
      )
    }
  ];
  const compute = (optionsValues: typeof initialValues, input: any) => {
    const { splitOperatorType, splitSeparator, joinSeparator } = optionsValues;

    setResult(
      reverseList(splitOperatorType, splitSeparator, joinSeparator, input)
    );
  };

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      input={input}
      setInput={setInput}
      inputComponent={
        <ToolTextInput
          title={t('list:reverse.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('list:reverse.resultTitle')} value={result} />
      }
      toolInfo={{
        title: t('list:reverse.toolInfo.title'),
        description: t('list:reverse.toolInfo.description')
      }}
      exampleCards={exampleCards}
    />
  );
}
