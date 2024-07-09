import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '../../../components/input/ToolTextInput';
import ToolTextResult from '../../../components/result/ToolTextResult';
import * as Yup from 'yup';
import ToolOptions from '../../../components/options/ToolOptions';
import { SplitOperatorType, findUniqueCompute } from './service';
import ToolInputAndResult from '../../../components/ToolInputAndResult';
import SimpleRadio from '../../../components/options/SimpleRadio';
import TextFieldWithDesc from '../../../components/options/TextFieldWithDesc';
import CheckboxWithDesc from '../../../components/options/CheckboxWithDesc';
import SelectWithDesc from '../../../components/options/SelectWithDesc';

const initialValues = {
  splitOperatorType: 'symbol' as SplitOperatorType,
  splitSeparator: ',',
  joinSeparator: '\\n',
  deleteEmptyItems: true,
  caseSensitive: false,
  trimItems: true,
  absolutelyUnique: false
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

export default function FindUnique() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const compute = (optionsValues: typeof initialValues, input: any) => {
    const {
      splitOperatorType,
      splitSeparator,
      joinSeparator,
      deleteEmptyItems,
      trimItems,
      caseSensitive,
      absolutelyUnique
    } = optionsValues;

    setResult(
      findUniqueCompute(
        splitOperatorType,
        splitSeparator,
        joinSeparator,
        input,
        deleteEmptyItems,
        trimItems,
        caseSensitive,
        absolutelyUnique
      )
    );
  };
  const validationSchema = Yup.object({
    // splitSeparator: Yup.string().required('The separator is required')
  });

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
        result={<ToolTextResult title={'Unique items'} value={result} />}
      />
      <ToolOptions
        compute={compute}
        getGroups={({ values, updateField }) => [
          {
            title: 'Input List Delimiter',
            component: (
              <Box>
                {splitOperators.map(({ title, description, type }) => (
                  <SimpleRadio
                    key={type}
                    onClick={() => updateField('splitOperatorType', type)}
                    title={title}
                    description={description}
                    checked={values.splitOperatorType === type}
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
            title: 'Output List Delimiter',
            component: (
              <Box>
                <TextFieldWithDesc
                  value={values.joinSeparator}
                  onOwnChange={(value) => updateField('joinSeparator', value)}
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
                  title={'Skip empty items'}
                  description={
                    "Don't include the empty list items in the output."
                  }
                  checked={values.deleteEmptyItems}
                  onChange={(value) => updateField('deleteEmptyItems', value)}
                />
              </Box>
            )
          },
          {
            title: 'Unique Item Options',
            component: (
              <Box>
                <CheckboxWithDesc
                  title={'Find Absolutely Unique Items'}
                  description={
                    'Display only those items of the list that exist in a single copy.'
                  }
                  checked={values.absolutelyUnique}
                  onChange={(value) => updateField('absolutelyUnique', value)}
                />
              </Box>
            )
          }
        ]}
        initialValues={initialValues}
        input={input}
        validationSchema={validationSchema}
      />
    </Box>
  );
}
