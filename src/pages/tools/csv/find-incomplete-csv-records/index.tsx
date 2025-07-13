import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { findIncompleteCsvRecords } from './service';
import { InitialValuesType } from './types';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  csvSeparator: ',',
  quoteCharacter: '"',
  commentCharacter: '#',
  emptyLines: true,
  emptyValues: true,
  messageLimit: false,
  messageNumber: 10
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'CSV Completeness Check',
    description:
      'In this example, we upload a simple CSV file containing names, surnames, and dates of birth. The tool analyzes the data and displays a green "Complete CSV" badge as it finds that there are no missing values or empty records. To say it differently, this check confirms that all rows and columns have the expected number of values in the data and the file is ready for use in any software that imports CSV files without hiccups.',
    sampleText: `name,surname,dob
John,Warner,1990-05-15
Lily,Meadows,1985-12-20
Jaime,Crane,1993-01-23
Jeri,Carroll,2000-11-07
Simon,Harper,2013-04-10`,
    sampleResult: `The Csv input is complete.`,
    sampleOptions: {
      csvSeparator: ',',
      quoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: true,
      emptyValues: true,
      messageLimit: false,
      messageNumber: 10
    }
  },
  {
    title: 'Find Missing Fields in Broken CSV',
    description:
      'In this example, we find the missing fields in a CSV file containing city names, time zones, and standard time information. As a result of the analysis, we see a red badge in the output and a text list of missing values in the dataset. The file has missing values on two rows: row 3 lacks standard time data (column 3), and row 5 lacks time zone and standard time data (columns 2 and 3).',
    sampleText: `City,Time Zone,Standard Time
London,UTC+00:00,GMT
Chicago,UTC-06:00
Tokyo,UTC+09:00,JST
Sydney
Berlin,UTC+01:00,CET`,
    sampleResult: `Title: Found missing column(s) on line 3
Message: Line 3 has 1 missing column(s).

Title: Found missing column(s) on line 5
Message: Line 5 has 2 missing column(s).`,
    sampleOptions: {
      csvSeparator: ',',
      quoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: true,
      emptyValues: false,
      messageLimit: true,
      messageNumber: 10
    }
  },
  {
    title: 'Detect Empty and Missing Values',
    description:
      'This example checks a data file containing information astronomical data about constellations. Not only does it find incomplete records but also detects all empty fields by activating the "Find Empty Values" checkbox. The empty fields are those that have zero length or contain just whitespace. Such fields contain no information. Additionally, since this file uses semicolons instead of commas for separators, we specify the ";" symbol in the options to make the program work with SSV (Semicolon-Separated Values) data. As a result, the program identifies three empty fields and one row with missing data.',
    sampleText: `Abbreviation;Constellation;Main stars

Cas;Cassiopeia;5
Cep;Cepheus;7
;Andromeda;16

Cyg;;
Del;Delphinus`,
    sampleResult: `Title: Found missing values on line 4
Message: Empty values on line 4: column 1.

Title: Found missing values on line 5
Message: Empty values on line 5: column 2, column 3.

Title: Found missing column(s) on line 6
Message: Line 6 has 1 missing column(s).`,
    sampleOptions: {
      csvSeparator: ';',
      quoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: true,
      emptyValues: true,
      messageLimit: true,
      messageNumber: 10
    }
  }
];
export default function FindIncompleteCsvRecords({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    setResult(findIncompleteCsvRecords(input, values));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('csv.findIncompleteCsvRecords.csvInputOptions'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.csvSeparator}
            onOwnChange={(val) => updateField('csvSeparator', val)}
            description={t(
              'csv.findIncompleteCsvRecords.csvSeparatorDescription'
            )}
          />
          <TextFieldWithDesc
            value={values.quoteCharacter}
            onOwnChange={(val) => updateField('quoteCharacter', val)}
            description={t(
              'csv.findIncompleteCsvRecords.quoteCharacterDescription'
            )}
          />
          <TextFieldWithDesc
            value={values.commentCharacter}
            onOwnChange={(val) => updateField('commentCharacter', val)}
            description={t(
              'csv.findIncompleteCsvRecords.commentCharacterDescription'
            )}
          />
        </Box>
      )
    },
    {
      title: t('csv.findIncompleteCsvRecords.checkingOptions'),
      component: (
        <Box>
          <CheckboxWithDesc
            checked={values.emptyLines}
            onChange={(value) => updateField('emptyLines', value)}
            title={t('csv.findIncompleteCsvRecords.deleteLinesWithNoData')}
            description={t(
              'csv.findIncompleteCsvRecords.deleteLinesWithNoDataDescription'
            )}
          />

          <CheckboxWithDesc
            checked={values.emptyValues}
            onChange={(value) => updateField('emptyValues', value)}
            title={t('csv.findIncompleteCsvRecords.findEmptyValues')}
            description={t(
              'csv.findIncompleteCsvRecords.findEmptyValuesDescription'
            )}
          />

          <CheckboxWithDesc
            checked={values.messageLimit}
            onChange={(value) => updateField('messageLimit', value)}
            title={t('csv.findIncompleteCsvRecords.limitNumberOfMessages')}
          />

          {values.messageLimit && (
            <TextFieldWithDesc
              value={values.messageNumber}
              onOwnChange={(val) => updateField('messageNumber', Number(val))}
              type="number"
              inputProps={{ min: 1 }}
              description={t(
                'csv.findIncompleteCsvRecords.messageLimitDescription'
              )}
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
        <ToolTextInput
          title={t('csv.findIncompleteCsvRecords.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('csv.findIncompleteCsvRecords.resultTitle')}
          value={result}
        />
      }
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('csv.findIncompleteCsvRecords.toolInfo.title', { title }),
        description: longDescription
      }}
    />
  );
}
