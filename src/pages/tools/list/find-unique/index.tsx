import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import ToolContent from '@components/ToolContent';
import { findUniqueCompute, SplitOperatorType } from './service';
import SimpleRadio from '@components/options/SimpleRadio';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('list');
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

  return (
    <ToolContent
      title={t('findUnique.title')}
      initialValues={initialValues}
      compute={compute}
      input={input}
      setInput={setInput}
      inputComponent={
        <ToolTextInput
          title={t('findUnique.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('findUnique.resultTitle')} value={result} />
      }
      getGroups={({ values, updateField }) => [
        {
          title: t('findUnique.inputListDelimiter'),
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
                description={t('findUnique.delimiterDescription')}
                value={values.splitSeparator}
                onOwnChange={(val) => updateField('splitSeparator', val)}
              />
            </Box>
          )
        },
        {
          title: t('findUnique.outputListDelimiter'),
          component: (
            <Box>
              <TextFieldWithDesc
                value={values.joinSeparator}
                onOwnChange={(value) => updateField('joinSeparator', value)}
              />
              <CheckboxWithDesc
                title={t('findUnique.trimItems')}
                description={t('findUnique.trimItemsDescription')}
                checked={values.trimItems}
                onChange={(value) => updateField('trimItems', value)}
              />
              <CheckboxWithDesc
                title={t('findUnique.skipEmptyItems')}
                description={t('findUnique.skipEmptyItemsDescription')}
                checked={values.deleteEmptyItems}
                onChange={(value) => updateField('deleteEmptyItems', value)}
              />
            </Box>
          )
        },
        {
          title: t('findUnique.uniqueItemOptions'),
          component: (
            <Box>
              <CheckboxWithDesc
                title={t('findUnique.findAbsolutelyUniqueItems')}
                description={t(
                  'findUnique.findAbsolutelyUniqueItemsDescription'
                )}
                checked={values.absolutelyUnique}
                onChange={(value) => updateField('absolutelyUnique', value)}
              />
              <CheckboxWithDesc
                title={t('findUnique.caseSensitiveItems')}
                description={t('findUnique.caseSensitiveItemsDescription')}
                checked={values.caseSensitive}
                onChange={(value) => updateField('caseSensitive', value)}
              />
            </Box>
          )
        }
      ]}
    />
  );
}
