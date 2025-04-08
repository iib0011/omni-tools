import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { main } from './service';
import { InitialValuesType } from './types';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';

const initialValues: InitialValuesType = {
  csvSeparator: ',',
  quoteCharacter: '"',
  commentCharacter: '#',
  emptyLines: true,
  headerRow: true,
  spaces: 2
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Convert Music Playlist CSV to YAML',
    description:
      'In this example, we transform a short CSV file containing a music playlist into structured YAML data. The input CSV contains five records with three columns each and the output YAML contains five lists of lists (one list for each CSV record). In YAML, lists start with the "-" symbol and the nested lists are indented with two spaces',
    sampleText: `The Beatles,"Yesterday",Pop Rock
Queen,"Bohemian Rhapsody",Rock
Nirvana,"Smells Like Teen Spirit",Grunge
Michael Jackson,"Billie Jean",Pop
Stevie Wonder,"Superstition",Funk`,
    sampleResult: `-
  - The Beatles
  - Yesterday
  - Pop Rock
- 
  - Queen
  - Bohemian Rhapsody
  - Rock
- 
  - Nirvana
  - Smells Like Teen Spirit
  - Grunge
- 
  - Michael Jackson
  - Billie Jean
  - Pop
-
  - Stevie Wonder
  - Superstition
  - Funk`,
    sampleOptions: {
      ...initialValues,
      headerRow: false
    }
  },
  {
    title: 'Planetary CSV Data',
    description:
      'In this example, we are working with CSV data that summarizes key properties of three planets in our solar system. The data consists of three columns with headers "planet", "relative mass" (with "1" being the mass of earth), and "satellites". To preserve the header names in the output YAML data, we enable the "Transform Headers" option, creating a YAML file that contains a list of YAML objects, where each object has three keys: "planet", "relative mass", and "satellites".',
    sampleText: `planet,relative mass,satellites
Venus,0.815,0
Earth,1.000,1
Mars,0.107,2`,
    sampleResult: `-
  planet: Venus
  relative mass: 0.815
  satellites: '0'
- 
  planet: Earth
  relative mass: 1.000
  satellites: '1'
- 
  planet: Mars
  relative mass: 0.107
  satellites: '2'`,
    sampleOptions: {
      ...initialValues
    }
  },
  {
    title: 'Convert Non-standard CSV to YAML',
    description:
      'In this example, we convert a CSV file with non-standard formatting into a regular YAML file. The input data uses a semicolon as a separator for the "product", "quantity", and "price" fields. It also contains empty lines and lines that are commented out. To make the program work with this custom CSV file, we input the semicolon symbol in the CSV delimiter options. To skip comments, we specify "#" as the symbol that starts comments. And to remove empty lines, we activate the option for skipping blank lines (that do not contain any symbols). In the output, we obtain a YAML file that contains a list of three objects, which use CSV headers as keys. Additionally, the objects in the YAML file are indented with four spaces.',
    sampleText: `item;quantity;price
milk;2;3.50

#eggs;12;2.99
bread;1;4.25
#apples;4;1.99
cheese;1;8.99`,
    sampleResult: `-
  item: milk
  quantity: 2
  price: 3.50
-
  item: bread
  quantity: 1
  price: 4.25
-
  item: cheese
  quantity: 1
  price: 8.99`,
    sampleOptions: {
      ...initialValues,
      csvSeparator: ';'
    }
  }
];
export default function CsvToYaml({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    setResult(main(input, optionsValues));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: 'Adjust CSV input',
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.csvSeparator}
            onOwnChange={(val) => updateField('csvSeparator', val)}
            description={
              'Enter the character used to delimit columns in the CSV file.'
            }
          />
          <TextFieldWithDesc
            value={values.quoteCharacter}
            onOwnChange={(val) => updateField('quoteCharacter', val)}
            description={
              'Enter the quote character used to quote the CSV fields.'
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
      title: 'Conversion Options',
      component: (
        <Box>
          <CheckboxWithDesc
            checked={values.headerRow}
            onChange={(value) => updateField('headerRow', value)}
            title="Use Headers"
            description="Keep the first row as column names."
          />
          <CheckboxWithDesc
            checked={values.emptyLines}
            onChange={(value) => updateField('emptyLines', value)}
            title="Ignore Lines with No Data"
            description="Enable to prevent the conversion of empty lines in the input CSV file."
          />
        </Box>
      )
    },
    {
      title: 'Adjust YAML indentation',
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.spaces}
            type="number"
            onOwnChange={(val) => updateField('spaces', Number(val))}
            inputProps={{ min: 1 }}
            description={
              'Set the number of spaces to use for YAML indentation.'
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
      inputComponent={
        <ToolTextInput title={'Input CSV'} value={input} onChange={setInput} />
      }
      resultComponent={<ToolTextResult title={'Output YAML'} value={result} />}
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
