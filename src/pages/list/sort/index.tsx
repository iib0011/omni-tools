import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '../../../components/input/ToolTextInput';
import ToolTextResult from '../../../components/result/ToolTextResult';
import * as Yup from 'yup';
import ToolOptions from '../../../components/options/ToolOptions';
import { Sort, SortingMethod, SplitOperatorType } from './service';
import ToolInputAndResult from '../../../components/ToolInputAndResult';
import SimpleRadio from '../../../components/options/SimpleRadio';
import TextFieldWithDesc from '../../../components/options/TextFieldWithDesc';
import CheckboxWithDesc from '../../../components/options/CheckboxWithDesc';
import SelectWithDesc from '../../../components/options/SelectWithDesc';

const initialValues = {
  splitSeparatorType: 'symbol' as SplitOperatorType,
  sortingMethod: 'alphabetic' as SortingMethod,
  increasing: true,
  splitSeparator: ',',
  joinSeparator: ',',
  removeDuplicated: false,
  caseSensitive: false
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

export default function SplitText() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  // const formRef = useRef<FormikProps<typeof initialValues>>(null);
  const computeExternal = (optionsValues: typeof initialValues, input: any) => {
    const {
      splitSeparatorType,
      joinSeparator,
      splitSeparator,
      increasing,
      caseSensitive,
      removeDuplicated,
      sortingMethod
    } = optionsValues;

    setResult(
      Sort(
        sortingMethod,
        splitSeparatorType,
        input,
        increasing,
        splitSeparator,
        joinSeparator,
        removeDuplicated,
        caseSensitive
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
        result={<ToolTextResult title={'Sorted list'} value={result} />}
      />
      <ToolOptions
        compute={computeExternal}
        getGroups={({ values, updateField }) => [
          {
            title: 'Input item separator',
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
            title: 'Sort method',
            component: (
              <Box>
                <SelectWithDesc
                  selected={values.sortingMethod}
                  options={[
                    { label: 'Sort Alphabetically', value: 'alphabetic' },
                    { label: 'Sort Numerically', value: 'numeric' },
                    { label: 'Sort by Length', value: 'length' }
                  ]}
                  onChange={(value) => updateField('sortingMethod', value)}
                  description={'Select a sorting method.'}
                />
                <SelectWithDesc
                  selected={values.increasing}
                  options={[
                    { label: 'Increasing order', value: true },
                    { label: 'Decreasing order', value: false }
                  ]}
                  onChange={(value) => updateField('increasing', value)}
                  description={'Select a sorting order.'}
                />
                <CheckboxWithDesc
                  title={'Case Sensitive Sort'}
                  description={
                    'Sort uppercase and lowercase items separately. Capital letters precede lowercase letters in an ascending list. (Works only in alphabetical sorting mode.)'
                  }
                  checked={values.caseSensitive}
                  onChange={(val) => updateField('caseSensitive', val)}
                />
              </Box>
            )
          },
          {
            title: 'Sorted item properties',
            component: (
              <Box>
                <TextFieldWithDesc
                  description={
                    'Use this symbol as a joiner between items in a sorted list.'
                  }
                  value={values.joinSeparator}
                  onOwnChange={(val) => updateField('joinSeparator', val)}
                />
                <CheckboxWithDesc
                  title={'Remove duplicates'}
                  description={'Delete duplicate list items.'}
                  checked={values.removeDuplicated}
                  onChange={(val) => updateField('removeDuplicated', val)}
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
