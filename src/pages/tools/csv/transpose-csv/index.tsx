import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { transposeCSV } from './service';
import { InitialValuesType } from './types';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import SelectWithDesc from '@components/options/SelectWithDesc';

const initialValues: InitialValuesType = {
  separator: ',',
  commentCharacter: '#',
  customFill: false,
  customFillValue: 'x',
  quoteChar: '"'
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Transpose a 2x3 CSV',
    description:
      'This example transposes a CSV with 2 rows and 3 columns. The tool splits the input data by the comma character, creating a 2 by 3 matrix. It then exchanges elements, turning columns into rows and vice versa. The output is a transposed CSV with flipped dimensions',
    sampleText: `foo,bar,baz
val1,val2,val3`,
    sampleResult: `foo,val1
bar,val2
baz,val3`,
    sampleOptions: {
      separator: ',',
      commentCharacter: '#',
      customFill: false,
      customFillValue: 'x',
      quoteChar: '"'
    }
  },
  {
    title: 'Transpose a Long CSV',
    description:
      'In this example, we flip a vertical single-column CSV file containing a list of our favorite fruits and their emojis. This single column is transformed into a single-row CSV file and the rows length matches the height of the original CSV.',
    sampleText: `Tasty Fruit
🍑 peaches
🍒 cherries
🥝 kiwis
🍓 strawberries
🍎 apples
🍐 pears
🥭 mangos
🍍 pineapples
🍌 bananas
🍊 tangerines
🍉 watermelons
🍇 grapes`,
    sampleResult: `fTasty Fruit,🍑 peaches,🍒 cherries,🥝 kiwis,🍓 strawberries,🍎 apples,🍐 pears,🥭 mangos,🍍 pineapples,🍌 bananas,🍊 tangerines,🍉 watermelons,🍇 grapes`,
    sampleOptions: {
      separator: ',',
      commentCharacter: '#',
      customFill: false,
      customFillValue: 'x',
      quoteChar: '"'
    }
  },
  {
    title: 'Clean and Transpose CSV Data',
    description:
      'In this example, we perform three tasks simultaneously: transpose a CSV file, remove comments and empty lines, and fix missing data. The transposition operation is the same as flipping a matrix across its diagonal and it is done automatically by the program. Additionally, the program automatically removes all empty lines as they cannot be transposed. The comments are removed by specifying the "#" symbol in the options. The program also fixes missing data using a custom bullet symbol "•", which is specified in the options.',
    sampleText: `Fish Type,Color,Habitat
Goldfish,Gold,Freshwater

#Clownfish,Orange,Coral Reefs
Tuna,Silver,Saltwater

Shark,Grey,Saltwater
Salmon,Silver`,
    sampleResult: `Fish Type,Goldfish,Tuna,Shark,Salmon
Color,Gold,Silver,Grey,Silver
Habitat,Freshwater,Saltwater,Saltwater,•`,
    sampleOptions: {
      separator: ',',
      commentCharacter: '#',
      customFill: true,
      customFillValue: '•',
      quoteChar: '"'
    }
  }
];
export default function TransposeCsv({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    setResult(transposeCSV(input, values));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: 'Csv input Options',
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.separator}
            onOwnChange={(val) => updateField('separator', val)}
            description={
              'Enter the character used to delimit columns in the CSV input file.'
            }
          />
          <TextFieldWithDesc
            value={values.quoteChar}
            onOwnChange={(val) => updateField('quoteChar', val)}
            description={
              'Enter the quote character used to quote the CSV input fields.'
            }
          />
          <TextFieldWithDesc
            value={values.commentCharacter}
            onOwnChange={(val) => updateField('commentCharacter', val)}
            description={
              'Enter the character indicating the start of a comment line. Lines starting with this symbol will be skipped.'
            }
          />
        </Box>
      )
    },
    {
      title: 'Fixing CSV Options',
      component: (
        <Box>
          <SelectWithDesc
            selected={values.customFill}
            options={[
              { label: 'Fill With Empty Values', value: false },
              { label: 'Fill with Custom Values', value: true }
            ]}
            onChange={(value) => updateField('customFill', value)}
            description={
              'Insert empty fields or custom values where the CSV data is missing (not empty).'
            }
          />

          {values.customFill && (
            <TextFieldWithDesc
              value={values.customFillValue}
              onOwnChange={(val) => updateField('customFillValue', val)}
              description={
                'Enter the character used to fill missing values in the CSV input file.'
              }
            />
          )}
        </Box>
      )
    }
  ];
  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolTextInput title="Input CSV" value={input} onChange={setInput} />
      }
      resultComponent={<ToolTextResult title="Transposed CSV" value={result} />}
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
