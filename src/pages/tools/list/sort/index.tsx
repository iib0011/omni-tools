import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { Sort, SortingMethod, SplitOperatorType } from './service';
import SimpleRadio from '@components/options/SimpleRadio';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import SelectWithDesc from '@components/options/SelectWithDesc';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';

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

export default function SortList({ title }: ToolComponentProps) {
  const { t } = useTranslation('list');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const compute = (optionsValues: typeof initialValues, input: any) => {
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

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolTextInput
          title={t('sort.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('sort.resultTitle')} value={result} />
      }
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: t('sort.inputItemSeparator'),
          component: (
            <Box>
              {splitOperators.map(({ title, description, type }) => (
                <SimpleRadio
                  key={type}
                  onClick={() => updateField('splitSeparatorType', type)}
                  title={t(`sort.splitOperators.${type}.title`)}
                  description={t(`sort.splitOperators.${type}.description`)}
                  checked={values.splitSeparatorType === type}
                />
              ))}
              <TextFieldWithDesc
                description={t('sort.splitSeparatorDescription')}
                value={values.splitSeparator}
                onOwnChange={(val) => updateField('splitSeparator', val)}
              />
            </Box>
          )
        },
        {
          title: t('sort.sortMethod'),
          component: (
            <Box>
              <SelectWithDesc
                selected={values.sortingMethod}
                options={[
                  {
                    label: t('sort.sortOptions.alphabetic'),
                    value: 'alphabetic'
                  },
                  {
                    label: t('sort.sortOptions.numeric'),
                    value: 'numeric'
                  },
                  { label: t('sort.sortOptions.length'), value: 'length' }
                ]}
                onChange={(value) => updateField('sortingMethod', value)}
                description={t('sort.sortMethodDescription')}
              />
              <SelectWithDesc
                selected={values.increasing}
                options={[
                  {
                    label: t('sort.orderOptions.increasing'),
                    value: true
                  },
                  {
                    label: t('sort.orderOptions.decreasing'),
                    value: false
                  }
                ]}
                onChange={(value) => {
                  updateField('increasing', value);
                }}
                description={t('sort.orderDescription')}
              />
              <CheckboxWithDesc
                title={t('sort.caseSensitive')}
                description={t('sort.caseSensitiveDescription')}
                checked={values.caseSensitive}
                onChange={(val) => updateField('caseSensitive', val)}
              />
            </Box>
          )
        },
        {
          title: t('sort.sortedItemProperties'),
          component: (
            <Box>
              <TextFieldWithDesc
                description={t('sort.joinSeparatorDescription')}
                value={values.joinSeparator}
                onOwnChange={(val) => updateField('joinSeparator', val)}
              />
              <CheckboxWithDesc
                title={t('sort.removeDuplicates')}
                description={t('sort.removeDuplicatesDescription')}
                checked={values.removeDuplicated}
                onChange={(val) => updateField('removeDuplicated', val)}
              />
            </Box>
          )
        }
      ]}
      compute={compute}
      setInput={setInput}
    />
  );
}
