import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import ToolOptions from '@components/options/ToolOptions';
import {
  DisplayFormat,
  SortingMethod,
  SplitOperatorType,
  TopItemsList
} from './service';
import ToolInputAndResult from '@components/ToolInputAndResult';
import SimpleRadio from '@components/options/SimpleRadio';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import SelectWithDesc from '@components/options/SelectWithDesc';

const initialValues = {
  splitSeparatorType: 'symbol' as SplitOperatorType,
  sortingMethod: 'alphabetic' as SortingMethod,
  displayFormat: 'count' as DisplayFormat,
  splitSeparator: ',',
  deleteEmptyItems: false,
  ignoreItemCase: false,
  trimItems: false
};
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

export default function FindMostPopular() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const compute = (optionsValues: typeof initialValues, input: any) => {
    const {
      splitSeparatorType,
      splitSeparator,
      displayFormat,
      sortingMethod,
      deleteEmptyItems,
      ignoreItemCase,
      trimItems
    } = optionsValues;

    setResult(
      TopItemsList(
        splitSeparatorType,
        sortingMethod,
        displayFormat,
        splitSeparator,
        input,
        deleteEmptyItems,
        ignoreItemCase,
        trimItems
      )
    );
  };

  return (
    <Box>
      <ToolInputAndResult
        input={
          <ToolTextInput
            title={'Input list'}
            value={input}
            onChange={setInput}
          />
        }
        result={<ToolTextResult title={'Most popular items'} value={result} />}
      />
      <ToolOptions
        compute={compute}
        getGroups={({ values, updateField }) => [
          {
            title: 'How to Extract List Items?',
            component: (
              <Box>
                {splitOperators.map(({ title, description, type }) => (
                  <SimpleRadio
                    key={type}
                    onClick={() => updateField('splitSeparatorType', type)}
                    title={title}
                    description={description}
                    checked={values.splitSeparatorType === type}
                  />
                ))}
                <TextFieldWithDesc
                  description={'Set a delimiting symbol or regular expression.'}
                  value={values.splitSeparator}
                  onOwnChange={(val) => updateField('splitSeparator', val)}
                />
              </Box>
            )
          },
          {
            title: 'Item comparison',
            component: (
              <Box>
                <CheckboxWithDesc
                  title={'Remove empty items'}
                  description={'Ignore empty items from comparison.'}
                  checked={values.deleteEmptyItems}
                  onChange={(value) => updateField('deleteEmptyItems', value)}
                />
                <CheckboxWithDesc
                  title={'Trim top list items'}
                  description={
                    'Remove leading and trailing spaces before comparing items'
                  }
                  checked={values.trimItems}
                  onChange={(value) => updateField('trimItems', value)}
                />
                <CheckboxWithDesc
                  title={'Ignore Item Case'}
                  description={'Compare all list items in lowercase.'}
                  checked={values.ignoreItemCase}
                  onChange={(value) => updateField('ignoreItemCase', value)}
                />
              </Box>
            )
          },
          {
            title: 'Top item output format',
            component: (
              <Box>
                <SelectWithDesc
                  selected={values.displayFormat}
                  options={[
                    { label: 'Show item percentage', value: 'percentage' },
                    { label: 'Show item count', value: 'count' },
                    { label: 'Show item total', value: 'total' }
                  ]}
                  onChange={(value) => updateField('displayFormat', value)}
                  description={'How to display the most popular list items?'}
                />
                <SelectWithDesc
                  selected={values.sortingMethod}
                  options={[
                    { label: 'Sort Alphabetically', value: 'alphabetic' },
                    { label: 'Sort by count', value: 'count' }
                  ]}
                  onChange={(value) => updateField('sortingMethod', value)}
                  description={'Select a sorting method.'}
                />
              </Box>
            )
          }
        ]}
        initialValues={initialValues}
        input={input}
      />
    </Box>
  );
}
