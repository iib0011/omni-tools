import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { changeCsvSeparator } from './service';
import { InitialValuesType } from './types';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';

const initialValues: InitialValuesType = {
  inputSeparator: ',',
  inputQuoteCharacter: '"',
  commentCharacter: '#',
  emptyLines: false,
  outputSeparator: ';',
  outputQuoteAll: false,
  OutputQuoteCharacter: '"'
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Change the CSV Delimiter to a Semicolon',
    description:
      'In this example, we change the column separator to the semicolon separator in a CSV file containing data about countries, their populations, and population densities. As you can see, the input CSV file uses the standard commas as separators. After specifying this delimiter in the source CSV options, we set a new CSV delimiter for the output file to a semicolon, resulting in a new CSV file that now uses semicolons ";" in the output. Such CSV files with semicolons are called SSV files (semicolon-separated values files)',
    sampleText: `country,population,density
China,1412,152
India,1408,428
United States,331,37
Indonesia,273,145
Pakistan,231,232
Brazil,214,26`,
    sampleResult: `country;population;density
China;1412;152
India;1408;428
United States;331;37
Indonesia;273;145
Pakistan;231;232
Brazil;214;26`,
    sampleOptions: {
      inputSeparator: ',',
      inputQuoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: false,
      outputSeparator: ';',
      outputQuoteAll: false,
      OutputQuoteCharacter: '"'
    }
  },
  {
    title: 'Restore a CSV File to the Standard Format',
    description:
      'In this example, a data scientist working with flowers was given an unusual CSV file that uses the vertical bar symbol as the field separator (such files are called PSV files – pipe-separated values files). To transform the file back to the standard comma-separated values (CSV) file, in the options, she set the input delimiter to "|" and the new delimiter to ",". She also wrapped the output fields in single quotes, enabled the option to remove empty lines from the input, and discarded comment lines starting with the "#" symbol.',
    sampleText: `species|height|days|temperature

Sunflower|50cm|30|25°C
Rose|40cm|25|22°C
Tulip|35cm|20|18°C
Daffodil|30cm|15|20°C

Lily|45cm|28|23°C
#pumpkin
Brazil,214,26`,
    sampleResult: `'species','height','days','temperature'
'Sunflower','50cm','30','25°C'
'Rose','40cm','25','22°C'
'Tulip','35cm','20','18°C'
'Daffodil','30cm','15','20°C'
'Lily','45cm','28','23°C'`,
    sampleOptions: {
      inputSeparator: '|',
      inputQuoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: true,
      outputSeparator: ',',
      outputQuoteAll: true,
      OutputQuoteCharacter: "'"
    }
  },
  {
    title: 'Plants vs. Zombies CSV',
    description:
      'In this example, we import CSV data with zombie characters from the game Plants vs. Zombies. The data includes zombies names, the level at which they first appear in the game, their health, damage, and speed. The data follows the standard CSV format, with commas serving as field separators. To change the readability of the file, we replace the usual comma delimiter with a slash symbol, creating a slash-separated values file.',
    sampleText: `zombie_name,first_seen,health,damage,speed
Normal Zombie,Level 1-1,181,100,4.7
Conehead Zombie,Level 1-3,551,100,4.7
Buckethead Zombi,Level 1-8,1281,100,4.7
Newspaper Zombie,Level 2-1,331,100,4.7
Football Zombie,Level 2-6,1581,100,2.5
Dancing Zombie,Level 2-8,335,100,1.5
Zomboni,Level 3-6,1151,Instant-kill,varies
Catapult Zombie,Level 5-6,651,75,2.5
Gargantuar,Level 5-8,3000,Instant-kill,4.7`,
    sampleResult: `zombie_name/first_seen/health/damage/speed
Normal Zombie/Level 1-1/181/100/4.7
Conehead Zombie/Level 1-3/551/100/4.7
Buckethead Zombi/Level 1-8/1281/100/4.7
Newspaper Zombie/Level 2-1/331/100/4.7
Football Zombie/Level 2-6/1581/100/2.5
Dancing Zombie/Level 2-8/335/100/1.5
Zomboni/Level 3-6/1151/Instant-kill/varies
Catapult Zombie/Level 5-6/651/75/2.5
Gargantuar/Level 5-8/3000/Instant-kill/4.7`,
    sampleOptions: {
      inputSeparator: ',',
      inputQuoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: true,
      outputSeparator: '/',
      outputQuoteAll: false,
      OutputQuoteCharacter: "'"
    }
  }
];
export default function ChangeCsvDelimiter({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    setResult(changeCsvSeparator(input, values));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: 'Adjust CSV input options',
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.inputSeparator}
            onOwnChange={(val) => updateField('inputSeparator', val)}
            description={
              'Enter the character used to delimit columns in the CSV input file.'
            }
          />
          <TextFieldWithDesc
            value={values.inputQuoteCharacter}
            onOwnChange={(val) => updateField('inputQuoteCharacter', val)}
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
          <CheckboxWithDesc
            checked={values.emptyLines}
            onChange={(value) => updateField('emptyLines', value)}
            title="Delete Lines with No Data"
            description="Remove empty lines from CSV input file."
          />
        </Box>
      )
    },
    {
      title: 'Output options',
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.outputSeparator}
            onOwnChange={(val) => updateField('outputSeparator', val)}
            description={
              'Enter the character used to delimit columns in the CSV output file.'
            }
          />
          <CheckboxWithDesc
            checked={values.outputQuoteAll}
            onChange={(value) => updateField('outputQuoteAll', value)}
            title="Quote All Output Fields"
            description="Wrap all fields of the output CSV file in quotes"
          />
          {values.outputQuoteAll && (
            <TextFieldWithDesc
              value={values.OutputQuoteCharacter}
              onOwnChange={(val) => updateField('OutputQuoteCharacter', val)}
              description={
                'Enter the quote character used to quote the CSV output fields.'
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
        <ToolTextInput title={'Input CSV'} value={input} onChange={setInput} />
      }
      resultComponent={<ToolTextResult title={'Output CSV'} value={result} />}
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: title, description: longDescription }}
    />
  );
}
