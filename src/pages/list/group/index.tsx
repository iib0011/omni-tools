import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '../../../components/input/ToolTextInput';
import ToolTextResult from '../../../components/result/ToolTextResult';
import * as Yup from 'yup';
import ToolOptions from '../../../components/options/ToolOptions';
import { groupList, SplitOperatorType } from './service';
import ToolInputAndResult from '../../../components/ToolInputAndResult';
import SimpleRadio from '../../../components/options/SimpleRadio';
import TextFieldWithDesc from '../../../components/options/TextFieldWithDesc';
import CheckboxWithDesc from '../../../components/options/CheckboxWithDesc';

const initialValues = {
  splitOperatorType: 'symbol' as SplitOperatorType,
  splitSeparator: ',',
  groupNumber: 2,
  itemSeparator: ',',
  leftWrap: '[',
  rightWrap: ']',
  groupSeparator: '\\n',
  deleteEmptyItems: true,
  padNonFullGroup: false,
  paddingChar: '...'
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
      groupNumber,
      itemSeparator,
      leftWrap,
      rightWrap,
      groupSeparator,
      deleteEmptyItems,
      padNonFullGroup,
      paddingChar
    } = optionsValues;

    setResult(
      groupList(
        splitOperatorType,
        splitSeparator,
        input,
        groupNumber,
        itemSeparator,
        leftWrap,
        rightWrap,
        groupSeparator,
        deleteEmptyItems,
        padNonFullGroup,
        paddingChar
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
        result={<ToolTextResult title={'Grouped items'} value={result} />}
      />
      <ToolOptions
        compute={compute}
        getGroups={({ values, updateField }) => [
          {
            title: 'Input Item Separator',
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
            title: 'Group Size and Separators',
            component: (
              <Box>
                <TextFieldWithDesc
                  value={values.groupNumber}
                  description={'Number of items in a group'}
                  type={'number'}
                  onOwnChange={(value) =>
                    updateField('groupNumber', Number(value))
                  }
                />
                <TextFieldWithDesc
                  value={values.itemSeparator}
                  description={'Item separator character'}
                  onOwnChange={(value) => updateField('itemSeparator', value)}
                />
                <TextFieldWithDesc
                  value={values.groupSeparator}
                  description={'Group separator character'}
                  onOwnChange={(value) => updateField('groupSeparator', value)}
                />
                <TextFieldWithDesc
                  value={values.leftWrap}
                  description={"Group's left wrap symbol."}
                  onOwnChange={(value) => updateField('leftWrap', value)}
                />
                <TextFieldWithDesc
                  value={values.rightWrap}
                  description={"Group's right wrap symbol."}
                  onOwnChange={(value) => updateField('rightWrap', value)}
                />
              </Box>
            )
          },
          {
            title: 'Empty Items and Padding',
            component: (
              <Box>
                <CheckboxWithDesc
                  title={'Delete Empty Items'}
                  description={
                    "Ignore empty items and don't include them in the groups."
                  }
                  checked={values.deleteEmptyItems}
                  onChange={(value) => updateField('deleteEmptyItems', value)}
                />
                <CheckboxWithDesc
                  title={'Pad Non-full Groups'}
                  description={
                    'Fill non-full groups with a custom item (enter below).'
                  }
                  checked={values.padNonFullGroup}
                  onChange={(value) => updateField('padNonFullGroup', value)}
                />
                <TextFieldWithDesc
                  value={values.paddingChar}
                  description={
                    'Use this character or item to pad non-full groups.'
                  }
                  onOwnChange={(value) => updateField('paddingChar', value)}
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
