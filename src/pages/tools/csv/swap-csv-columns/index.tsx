import React, { useState } from 'react';
import { Box } from '@mui/material';
import ToolContent from '@components/ToolContent';
import { GetGroupsType } from '@components/options/ToolOptions';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import SelectWithDesc from '@components/options/SelectWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import SimpleRadio from '@components/options/SimpleRadio';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { csvColumnsSwap } from './service';
import { getCsvHeaders } from '@utils/csv';
import { InitialValuesType } from './types';

const initialValues: InitialValuesType = {
  fromPositionStatus: true,
  toPositionStatus: true,
  fromPosition: '1',
  toPosition: '2',
  fromHeader: '',
  toHeader: '',
  emptyValuesFilling: true,
  customFiller: '',
  deleteComment: true,
  commentCharacter: '#',
  emptyLines: true
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Move the Key Column to the First Position',
    description:
      'In this example, we use our CSV column swapping tool to bring the most important information to the first column. As we are planning to go on vacation soon, in the input of the tool, we load data about national parks that include their names and locations. To decide, which is the closest park to us, we need to see the parks location first, therefore, we swap the first and second data columns so that the "location" column is at the beginning of the CSV data.',
    sampleText: `park_name,location
Yellowstone,Wyoming
Yosemite,California
Grand Canyon,Arizona
Rocky Mountain,Colorado
Zion Park,Utah`,
    sampleResult: `location,park_name
Wyoming,Yellowstone
California,Yosemite
Arizona,Grand Canyon
Colorado,Rocky Mountain
Utah,Zion Park`,
    sampleOptions: {
      fromPositionStatus: true,
      toPositionStatus: true,
      fromPosition: '1',
      toPosition: '2',
      fromHeader: 'park_name',
      toHeader: 'location',
      emptyValuesFilling: false,
      customFiller: '*',
      deleteComment: false,
      commentCharacter: '',
      emptyLines: false
    }
  },
  {
    title: 'Reorganize Columns in Vitamins CSV',
    description:
      'In this example, a lab intern made a mistake and created a corrupted CSV file with mixed-up columns and missing data. To fix the file, we swap the columns based on the headers "Vitamin" and "Function" so that the "Vitamin" column becomes the first in the output data. We also fill the incomplete CSV data by adding a custom asterisk "*" symbol in place of missing values.',
    sampleText: `Function,Fat-Soluble,Vitamin,Sources
Supports vision,Fat-Soluble,A,Carrots
Immune function,Water-Soluble,C,Citrus fruits
Bone health,Fat-Soluble,D,Fatty fish
Antioxidant,Fat-Soluble,E,Nuts
Blood clotting,Fat-Soluble,K,Leafy greens
Energy production,Water-Soluble,B1
Energy production,Water-Soluble,B2
Energy production,Water-Soluble,B3,Meat
Protein metabolism,Water-Soluble,B6,Poultry
Nervous system,Water-Soluble,B12,Meat`,
    sampleResult: `Vitamin,Fat-Soluble,Function,Sources
A,Fat-Soluble,Supports vision,Carrots
C,Water-Soluble,Immune function,Citrus fruits
D,Fat-Soluble,Bone health,Fatty fish
E,Fat-Soluble,Antioxidant,Nuts
K,Fat-Soluble,Blood clotting,Leafy greens
B1,Water-Soluble,Energy production,*
B2,Water-Soluble,Energy production,*
B3,Water-Soluble,Energy production,Meat
B6,Water-Soluble,Protein metabolism,Poultry
B12,Water-Soluble,Nervous system,Meat`,
    sampleOptions: {
      fromPositionStatus: false,
      toPositionStatus: false,
      fromPosition: '1',
      toPosition: '2',
      fromHeader: 'Vitamin',
      toHeader: 'Function',
      emptyValuesFilling: false,
      customFiller: '*',
      deleteComment: false,
      commentCharacter: '',
      emptyLines: false
    }
  },
  {
    title: 'Place Columns Side by Side for Analysis',
    description:
      'In this example, we change the order of columns in a CSV dataset to have the columns essential for analysis adjacent to each other. We match the "ScreenSize" column by its name and place it in the second-to-last position "-2". This groups the "ScreenSize" and "Price" columns together, allowing us to easily compare and choose the phone we want to buy. We also remove empty lines and specify that lines starting with the "#" symbol are comments and should be left as is.',
    sampleText: `Brand,Model,ScreenSize,OS,Price

Apple,iPhone 15 Pro Max,6.7″,iOS,$1299
Samsung,Galaxy S23 Ultra,6.8″,Android,$1199
Google,Pixel 7 Pro,6.4″,Android,$899

#OnePlus,11 Pro,6.7″,Android,$949
Xiaomi,13 Ultra,6.6″,Android,$849`,
    sampleResult: `Brand,Model,OS,ScreenSize,Price
Apple,iPhone 15 Pro Max,iOS,6.7″,$1299
Samsung,Galaxy S23 Ultra,Android,6.8″,$1199
Google,Pixel 7 Pro,Android,6.4″,$899
Xiaomi,13 Ultra,Android,6.6″,$849`,
    sampleOptions: {
      fromPositionStatus: false,
      toPositionStatus: true,
      fromPosition: '1',
      toPosition: '4',
      fromHeader: 'ScreenSize',
      toHeader: 'OS',
      emptyValuesFilling: true,
      customFiller: 'x',
      deleteComment: true,
      commentCharacter: '#',
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

  const compute = (optionsValues: InitialValuesType, input: string) => {
    setResult(csvColumnsSwap(input, optionsValues));
  };

  const headers = getCsvHeaders(input);
  const headerOptions = headers.map((item) => ({
    label: `${item}`,
    value: item
  }));

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Swap-From Column',
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('fromPositionStatus', true)}
            title="Set Column-From position"
            checked={values.fromPositionStatus}
          />
          {values.fromPositionStatus && (
            <TextFieldWithDesc
              description={'Position of the first column you want to swap'}
              value={values.fromPosition}
              onOwnChange={(val) => updateField('fromPosition', val)}
              type="number"
              inputProps={{ min: 1, max: headers.length }}
            />
          )}

          <SimpleRadio
            onClick={() => updateField('fromPositionStatus', false)}
            title="Set Column-From Header"
            checked={!values.fromPositionStatus}
          />
          {!values.fromPositionStatus && (
            <SelectWithDesc
              selected={values.fromHeader}
              options={headerOptions}
              onChange={(value) => updateField('fromHeader', value)}
              description={'Header of the first column you want to swap.'}
            />
          )}
        </Box>
      )
    },
    {
      title: 'Swap-to Column',
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('toPositionStatus', true)}
            title="Set Column-To position"
            checked={values.toPositionStatus}
          />
          {values.toPositionStatus && (
            <TextFieldWithDesc
              description={'Position of the second column you want to swap'}
              value={values.toPosition}
              onOwnChange={(val) => updateField('toPosition', val)}
              type="number"
              inputProps={{ min: 1, max: headers.length }}
            />
          )}
          <SimpleRadio
            onClick={() => updateField('toPositionStatus', false)}
            title="Set Column-To Header"
            checked={!values.toPositionStatus}
          />
          {!values.toPositionStatus && (
            <SelectWithDesc
              selected={values.toHeader}
              options={headerOptions}
              onChange={(value) => updateField('toHeader', value)}
              description={'Header of the second column you want to swap..'}
            />
          )}
        </Box>
      )
    },
    {
      title: 'Incomplete Data',
      component: (
        <Box>
          <SelectWithDesc
            selected={values.emptyValuesFilling}
            options={[
              { label: 'Fill With Empty Values', value: true },
              { label: 'Fill with Custom Values', value: false }
            ]}
            onChange={(value) => updateField('emptyValuesFilling', value)}
            description={
              'Fill incomplete CSV data with empty symbols or a custom symbol.'
            }
          />
          {!values.emptyValuesFilling && (
            <TextFieldWithDesc
              description={
                'Specify a custom symbol to fill incomplete CSV data with'
              }
              value={values.customFiller}
              onOwnChange={(val) => updateField('customFiller', val)}
            />
          )}
        </Box>
      )
    },
    {
      title: 'Comments and Empty Lines',
      component: (
        <Box>
          <CheckboxWithDesc
            checked={values.deleteComment}
            onChange={(value) => updateField('deleteComment', value)}
            title="Delete Comments"
            description="if checked, comments given by the following character will be deleted"
          />
          {values.deleteComment && (
            <TextFieldWithDesc
              description={
                'Specify the character used to start comments in the input CSV (and if needed remove them via checkbox above)'
              }
              value={values.commentCharacter}
              onOwnChange={(val) => updateField('commentCharacter', val)}
            />
          )}

          <CheckboxWithDesc
            checked={values.emptyLines}
            onChange={(value) => updateField('emptyLines', value)}
            title="Delete Empty Lines"
            description="Do not include empty lines in the output data."
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
