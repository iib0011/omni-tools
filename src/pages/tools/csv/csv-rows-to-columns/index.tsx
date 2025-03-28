import React, { useState } from 'react';
import { Box } from '@mui/material';
import ToolContent from '@components/ToolContent';
import { GetGroupsType } from '@components/options/ToolOptions';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import SelectWithDesc from '@components/options/SelectWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { csvRowsToColumns } from './service';

const initialValues = {
  emptyValuesFilling: false,
  customFiller: 'x',
  commentCharacter: '//'
};
type InitialValuesType = typeof initialValues;
const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Convert CSV Rows to Columns',
    description:
      'In this example, we transform the input CSV file with a single horizontal row of six values "a,b,c,d,e,f" into a vertical column. The program takes this row, rotates it 90 degrees, and outputs it as a column with each CSV value on a new line. This operation can also be viewed as converting a 6-dimensional row vector into a 6-dimensional column vector.',
    sampleText: `a,b,c,d,e,f`,
    sampleResult: `a
b
c
d
e
f`,
    sampleOptions: {
      emptyValuesFilling: true,
      customFiller: '1',
      commentCharacter: '#'
    }
  },
  {
    title: 'Rows to Columns Transformation',
    description:
      'In this example, we load a CSV file containing coffee varieties and their origins. The file is quite messy, with numerous empty lines and comments, and it is hard to work with. To clean up the file, we specify the comment pattern // in the options, and the program automatically removes the comment lines from the input. Also, the empty lines are automatically removed. Once the file is cleaned up, we transform the five clean rows into five columns, each having a height of two fields.',
    sampleText: `Variety,Origin
Arabica,Ethiopia

Robusta,Africa
Liberica,Philippines

Mocha,Yemen
//green tea`,
    sampleResult: `Variety,Arabica,Robusta,Liberica,Mocha
Origin,Ethiopia,Africa,Philippines,Yemen`,
    sampleOptions: {
      emptyValuesFilling: true,
      customFiller: '1',
      commentCharacter: '//'
    }
  },
  {
    title: 'Fill Missing Data',
    description:
      'In this example, we swap rows and columns in CSV data about team sports, the equipment used, and the number of players. The input has 5 rows and 3 columns and once rows and columns have been swapped, the output has 3 rows and 5 columns. Also notice that in the last data record, for the "Baseball" game, the number of players is missing. To create a fully-filled CSV, we use a custom message "NA", specified in the options, and fill the missing CSV field with this value.',
    sampleText: `Sport,Equipment,Players
Basketball,Ball,5
Football,Ball,11
Soccer,Ball,11
Baseball,Bat & Ball`,
    sampleResult: `Sport,Basketball,Football,Soccer,Baseball
Equipment,Ball,Ball,Ball,Bat & Ball
Players,5,11,11,NA`,
    sampleOptions: {
      emptyValuesFilling: false,
      customFiller: 'NA',
      commentCharacter: '#'
    }
  }
];

export default function CsvRowsToColumns({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: typeof initialValues, input: string) => {
    setResult(
      csvRowsToColumns(
        input,
        optionsValues.emptyValuesFilling,
        optionsValues.customFiller,
        optionsValues.commentCharacter
      )
    );
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Fix incomplete data',
      component: (
        <Box>
          <SelectWithDesc
            selected={values.emptyValuesFilling}
            options={[
              { label: 'Fill With Empty Values', value: true },
              { label: 'Fill With Customs Values', value: false }
            ]}
            onChange={(value) => updateField('emptyValuesFilling', value)}
            description={
              'If the input CSV file is incomplete (missing values), then add empty fields or custom symbols to records to make a well-formed CSV?'
            }
          />
          {!values.emptyValuesFilling && (
            <TextFieldWithDesc
              value={values.customFiller}
              onOwnChange={(val) => updateField('customFiller', val)}
              description={
                'Use this custom value to fill in missing fields. (Works only with "Custom Values" mode above.)'
              }
            />
          )}
        </Box>
      )
    },
    {
      title: 'Lines with comments',
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.commentCharacter}
            onOwnChange={(val) => updateField('commentCharacter', val)}
            description={
              'Enter the symbol indicating the start of a comment line. (These lines are removed during conversion.)'
            }
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
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
      exampleCards={exampleCards}
    />
  );
}
