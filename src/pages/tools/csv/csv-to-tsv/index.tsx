import React, { useState } from 'react';
import { Box } from '@mui/material';
import ToolContent from '@components/ToolContent';
import { GetGroupsType } from '@components/options/ToolOptions';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { csvToTsv } from './service';

const initialValues = {
  delimiter: ',',
  quoteCharacter: '"',
  commentCharacter: '#',
  header: true,
  emptyLines: true
};
type InitialValuesType = typeof initialValues;
const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Convert Game Data from the CSV Format to the TSV Format',
    description:
      'This tool transforms Comma Separated Values (CSV) data to Tab Separated Values (TSV) data. Both CSV and TSV are popular file formats for storing tabular data but they use different delimiters to separate values – CSV uses commas (","), while TSV uses tabs ("\t"). If we compare CSV files to TSV files, then CSV files are much harder to parse than TSV files because the values themselves may contain commas, so it is not always obvious where one field starts and ends without complicated parsing rules. TSV, on the other hand, uses just a tab symbol, which does not usually appear in data, so separating fields in TSV is as simple as splitting the input by the tab character. To convert CSV to TSV, simply input the CSV data in the input of this tool. In rare cases when a CSV file has a delimiter other than a comma, you can specify the current delimiter in the options of the tool. You can also specify the current quote character and the comment start character. Additionally, empty CSV lines can be skipped by activating the "Ignore Lines with No Data" option. If this option is off, then empty lines in the CSV are converted to empty TSV lines. The "Preserve Headers" option allows you to choose whether to process column headers of a CSV file. If the option is selected, then the resulting TSV file will include the first row of the input CSV file, which contains the column names. Alternatively, if the headers option is not selected, the first row will be skipped during the data conversion process. For the reverse conversion from TSV to CSV, you can use our Convert TSV to CSV tool. Csv-abulous!',
    sampleText: `player_name,score,time,goals
ToniJackson,2500,30:00,15
HenryDalton,1800,25:00,12
DavidLee,3200,40:00,20
EmmaJones,2100,35:00,17
KrisDavis,1500,20:00,10`,
    sampleResult: `player_name	score	time	goals
ToniJackson	2500	30:00	15
HenryDalton	1800	25:00	12
DavidLee	3200	40:00	20
EmmaJones	2100	35:00	17
KrisDavis	1500	20:00	10`,
    sampleOptions: {
      delimiter: ',',
      quoteCharacter: '"',
      commentCharacter: '#',
      header: true,
      emptyLines: true
    }
  },
  {
    title: 'Mythical Creatures',
    description:
      'In this example, we load a CSV file containing coffee varieties and their origins. The file is quite messy, with numerous empty lines and comments, and it is hard to work with. To clean up the file, we specify the comment pattern // in the options, and the program automatically removes the comment lines from the input. Also, the empty lines are automatically removed. Once the file is cleaned up, we transform the five clean rows into five columns, each having a height of two fields.',
    sampleText: `creature;origin;habitat;powers
Unicorn;Mythology;Forest;Magic horn
Mermaid;Mythology;Ocean;Hypnotic singing
Vampire;Mythology;Castles;Immortality
Phoenix;Mythology;Desert;Rebirth from ashes

#Dragon;Mythology;Mountains;Fire breathing
#Werewolf;Mythology;Forests;Shapeshifting`,
    sampleResult: `Unicorn	Mythology	Forest	Magic horn
Mermaid	Mythology	Ocean	Hypnotic singing
Vampire	Mythology	Castles	Immortality
Phoenix	Mythology	Desert	Rebirth from ashes`,
    sampleOptions: {
      delimiter: ';',
      quoteCharacter: '"',
      commentCharacter: '#',
      header: false,
      emptyLines: true
    }
  },
  {
    title: 'Convet Fitness Tracker Data from CSV to TSV',
    description:
      'In this example, we swap rows and columns in CSV data about team sports, the equipment used, and the number of players. The input has 5 rows and 3 columns and once rows and columns have been swapped, the output has 3 rows and 5 columns. Also notice that in the last data record, for the "Baseball" game, the number of players is missing. To create a fully-filled CSV, we use a custom message "NA", specified in the options, and fill the missing CSV field with this value.',
    sampleText: `day,steps,distance,calories

Mon,7500,3.75,270
Tue,12000,6.00,420

Wed,8000,4.00,300
Thu,9500,4.75,330
Fri,10000,5.00,350`,
    sampleResult: `day	steps	distance	calories
Mon	7500	3.75	270
Tue	12000	6.00	420
Wed	8000	4.00	300
Thu	9500	4.75	330
Fri	10000	5.00	350`,
    sampleOptions: {
      delimiter: ',',
      quoteCharacter: '"',
      commentCharacter: '#',
      header: true,
      emptyLines: true
    }
  }
];

export default function CsvToTsv({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: typeof initialValues, input: string) => {
    setResult(
      csvToTsv(
        input,
        optionsValues.delimiter,
        optionsValues.quoteCharacter,
        optionsValues.commentCharacter,
        optionsValues.header,
        optionsValues.emptyLines
      )
    );
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'CSV Format Options',
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.delimiter}
            onOwnChange={(val) => updateField('delimiter', val)}
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
            checked={values.header}
            onChange={(value) => updateField('header', value)}
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
