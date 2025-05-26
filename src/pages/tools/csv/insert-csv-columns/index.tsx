import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { main } from './service';
import { getCsvHeaders } from '@utils/csv';
import { InitialValuesType } from './types';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import SelectWithDesc from '@components/options/SelectWithDesc';

const initialValues: InitialValuesType = {
  csvToInsert: '',
  commentCharacter: '#',
  separator: ',',
  quoteChar: '"',
  insertingPosition: 'append',
  customFill: false,
  customFillValue: '',
  customPostionOptions: 'headerName',
  headerName: '',
  rowNumber: 1
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Add One Column to a CSV File',
    description:
      'In this example, we insert a column with the title "city" into a CSV file that already contains two other columns with titles "name" and "age". The new column consists of three values: "city", "dallas", and "houston", corresponding to the height of the input CSV data. The value "city" is the header value (appearing on the first row) and values "dallas" and "houston" are data values (appearing on rows two and three). We specify the position of the new column by an ordinal number and set it to 1 in the options. This value indicates that the new "city" column should be placed after the first column.',
    sampleText: `name,age
john,25
emma,22`,
    sampleResult: `name,city,age
john,dallas,25
emma,houston,22`,
    sampleOptions: {
      csvToInsert: `city
dallas
houston`,
      commentCharacter: '#',
      separator: ',',
      quoteChar: '"',
      insertingPosition: 'custom',
      customFill: true,
      customFillValue: 'k',
      customPostionOptions: 'rowNumber',
      headerName: '',
      rowNumber: 1
    }
  },
  {
    title: 'Append Multiple columns by header Name',
    description:
      'In this example, we append two data columns to the end of CSV data. The input CSV has data about cars, including the "Brand" and "Model" of the car. We now add two more columns at the end: "Year" and "Price". To do this, we enter these two data columns in the comma-separated format in the "New Column" option, and to quickly add the new columns to the end of the CSV, then we specify the name of the header they should be put after.',
    sampleText: `Brand,Model
Toyota,Camry
Ford,Mustang
Honda,Accord
Chevrolet,Malibu`,
    sampleResult: `Brand,Model,Year,Price
Toyota,Camry,2022,25000
Ford,Mustang,2021,35000
Honda,Accord,2022,27000
Chevrolet,Malibu,2021,28000`,
    sampleOptions: {
      csvToInsert: `Year,Price
2022,25000
2021,35000
2022,27000
2021,28000`,
      commentCharacter: '#',
      separator: ',',
      quoteChar: '"',
      insertingPosition: 'custom',
      customFill: false,
      customFillValue: 'x',
      customPostionOptions: 'headerName',
      headerName: 'Model',
      rowNumber: 1
    }
  },
  {
    title: 'Append Multiple columns',
    description:
      'In this example, we append two data columns to the end of CSV data. The input CSV has data about cars, including the "Brand" and "Model" of the car. We now add two more columns at the end: "Year" and "Price". To do this, we enter these two data columns in the comma-separated format in the "New Column" option, and to quickly add the new columns to the end of the CSV, then we select append.',
    sampleText: `Brand,Model
Toyota,Camry
Ford,Mustang
Honda,Accord
Chevrolet,Malibu`,
    sampleResult: `Brand,Model,Year,Price
Toyota,Camry,2022,25000
Ford,Mustang,2021,35000
Honda,Accord,2022,27000
Chevrolet,Malibu,2021,28000`,
    sampleOptions: {
      csvToInsert: `Year,Price
2022,25000
2021,35000
2022,27000
2021,28000`,
      commentCharacter: '#',
      separator: ',',
      quoteChar: '"',
      insertingPosition: 'append',
      customFill: false,
      customFillValue: 'x',
      customPostionOptions: 'rowNumber',
      headerName: '',
      rowNumber: 1
    }
  }
];
export default function InsertCsvColumns({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    setResult(main(input, values));
  };

  const headers = getCsvHeaders(input);
  const headerOptions =
    headers.length > 0
      ? headers.map((item) => ({
          label: `${item}`,
          value: item
        }))
      : [];

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: 'CSV to insert',
      component: (
        <Box>
          <TextFieldWithDesc
            multiline
            rows={3}
            value={values.csvToInsert}
            onOwnChange={(val) => updateField('csvToInsert', val)}
            title="CSV separator"
            description={`Enter one or more columns you want to insert into the CSV.
              the character used to delimit columns has to be the same with the one in the CSV input file.
              Ps: Blank lines will be ignored`}
          />
        </Box>
      )
    },
    {
      title: 'CSV Options',
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
          <SelectWithDesc
            selected={values.customFill}
            options={[
              { label: 'Fill With Empty Values', value: false },
              { label: 'Fill With Customs Values', value: true }
            ]}
            onChange={(value) => {
              updateField('customFill', value);
              if (!value) {
                updateField('customFillValue', ''); // Reset custom fill value
              }
            }}
            description={
              'If the input CSV file is incomplete (missing values), then add empty fields or custom symbols to records to make a well-formed CSV?'
            }
          />
          {values.customFill && (
            <TextFieldWithDesc
              value={values.customFillValue}
              onOwnChange={(val) => updateField('customFillValue', val)}
              description={
                'Use this custom value to fill in missing fields. (Works only with "Custom Values" mode above.)'
              }
            />
          )}
        </Box>
      )
    },
    {
      title: 'Position Options',
      component: (
        <Box>
          <SelectWithDesc
            selected={values.insertingPosition}
            options={[
              { label: 'Prepend columns', value: 'prepend' },
              { label: 'Append columns', value: 'append' },
              { label: 'Custom position', value: 'custom' }
            ]}
            onChange={(value) => updateField('insertingPosition', value)}
            description={'Specify where to insert the columns in the CSV file.'}
          />

          {values.insertingPosition === 'custom' && (
            <SelectWithDesc
              selected={values.customPostionOptions}
              options={[
                { label: 'Header name', value: 'headerName' },
                { label: 'Position ', value: 'rowNumber' }
              ]}
              onChange={(value) => updateField('customPostionOptions', value)}
              description={
                'Select the method to insert the columns in the CSV file.'
              }
            />
          )}

          {values.insertingPosition === 'custom' &&
            values.customPostionOptions === 'headerName' && (
              <SelectWithDesc
                selected={values.headerName}
                options={headerOptions}
                onChange={(value) => updateField('headerName', value)}
                description={
                  'Header of the column you want to insert columns after.'
                }
              />
            )}

          {values.insertingPosition === 'custom' &&
            values.customPostionOptions === 'rowNumber' && (
              <TextFieldWithDesc
                value={values.rowNumber}
                onOwnChange={(val) => updateField('rowNumber', Number(val))}
                inputProps={{ min: 1, max: headers.length }}
                type="number"
                description={
                  'Number of the column you want to insert columns after.'
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
        <ToolTextInput value={input} title="Input CSV" onChange={setInput} />
      }
      resultComponent={<ToolTextResult title="Output CSV" value={result} />}
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
