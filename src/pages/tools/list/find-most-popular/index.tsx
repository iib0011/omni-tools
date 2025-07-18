import { Box } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import {
  DisplayFormat,
  SortingMethod,
  SplitOperatorType,
  TopItemsList
} from './service';
import SimpleRadio from '@components/options/SimpleRadio';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import SelectWithDesc from '@components/options/SelectWithDesc';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { ParseKeys } from 'i18next';

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
  title: ParseKeys<'list'>;
  description: ParseKeys<'list'>;
  type: SplitOperatorType;
}[] = [
  {
    title: 'findMostPopular.splitOperators.symbol.title',
    description: 'findMostPopular.splitOperators.symbol.description',
    type: 'symbol'
  },
  {
    title: 'findMostPopular.splitOperators.regex.title',
    type: 'regex',
    description: 'findMostPopular.splitOperators.regex.description'
  }
];

export default function FindMostPopular({ title }: ToolComponentProps) {
  const { t } = useTranslation('list');
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
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolTextInput
          title={t('findMostPopular.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('findMostPopular.resultTitle')}
          value={result}
        />
      }
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: t('findMostPopular.extractListItems'),
          component: (
            <Box>
              {splitOperators.map(({ title, description, type }) => (
                <SimpleRadio
                  key={type}
                  onClick={() => updateField('splitSeparatorType', type)}
                  title={t(title)}
                  description={t(description)}
                  checked={values.splitSeparatorType === type}
                />
              ))}
              <TextFieldWithDesc
                description={t('findMostPopular.splitSeparatorDescription')}
                value={values.splitSeparator}
                onOwnChange={(val) => updateField('splitSeparator', val)}
              />
            </Box>
          )
        },
        {
          title: t('findMostPopular.itemComparison'),
          component: (
            <Box>
              <CheckboxWithDesc
                title={t('findMostPopular.removeEmptyItems')}
                description={t('findMostPopular.removeEmptyItemsDescription')}
                checked={values.deleteEmptyItems}
                onChange={(value) => updateField('deleteEmptyItems', value)}
              />
              <CheckboxWithDesc
                title={t('findMostPopular.trimItems')}
                description={t('findMostPopular.trimItemsDescription')}
                checked={values.trimItems}
                onChange={(value) => updateField('trimItems', value)}
              />
              <CheckboxWithDesc
                title={t('findMostPopular.ignoreItemCase')}
                description={t('findMostPopular.ignoreItemCaseDescription')}
                checked={values.ignoreItemCase}
                onChange={(value) => updateField('ignoreItemCase', value)}
              />
            </Box>
          )
        },
        {
          title: t('findMostPopular.outputFormat'),
          component: (
            <Box>
              <SelectWithDesc
                selected={values.displayFormat}
                options={[
                  {
                    label: t('findMostPopular.displayOptions.percentage'),
                    value: 'percentage'
                  },
                  {
                    label: t('findMostPopular.displayOptions.count'),
                    value: 'count'
                  },
                  {
                    label: t('findMostPopular.displayOptions.total'),
                    value: 'total'
                  }
                ]}
                onChange={(value) => updateField('displayFormat', value)}
                description={t('findMostPopular.displayFormatDescription')}
              />
              <SelectWithDesc
                selected={values.sortingMethod}
                options={[
                  {
                    label: t('findMostPopular.sortOptions.alphabetic'),
                    value: 'alphabetic'
                  },
                  {
                    label: t('findMostPopular.sortOptions.count'),
                    value: 'count'
                  }
                ]}
                onChange={(value) => updateField('sortingMethod', value)}
                description={t('findMostPopular.sortingMethodDescription')}
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
