import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { chunkList, SplitOperatorType } from './service';
import SimpleRadio from '@components/options/SimpleRadio';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { CardExampleType } from '@components/examples/ToolExamples';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { formatNumber } from '../../../../utils/number';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';

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

type InitialValuesType = typeof initialValues;

const splitOperators: SplitOperatorType[] = ['symbol', 'regex'];

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Group Hexagon Coordinates',
    description:
      'In this example, we group the coordinates of a regular hexagon. The input coordinates are given as a space-separated list "x1 y1 x2 y2 x3 y3 …". What we want to do is create vector point pairs such as "(x1, y1); (x2, y2); (x3, y3); …". To do that, we use the space character as the input coordinate separator, and to create vectors, we group them by pairs. We wrap the coordinates in parentheses, put a comma between the x and y group items, and a semicolon between individual groups.',
    sampleText: '2.5 9.33 0 5 2.5 0.66 7.5 0.66 10 5 7.5 9.33',
    sampleResult: `(2.5, 9.33); (0, 5); (2.5, 0.66); (7.5, 0.66); (10, 5); (7.5, 9.33)`,
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: ' ',
      groupNumber: 2,
      itemSeparator: ', ',
      leftWrap: '(',
      rightWrap: ')',
      groupSeparator: '; ',
      deleteEmptyItems: true,
      padNonFullGroup: false,
      paddingChar: 'x'
    }
  },
  {
    title: 'Chunks of Size 3',
    description:
      'This example demonstrates grouping of list items and creates 9 groups of 3 items. The input list contains all alphabet letters (26 letters, separated by a semicolon) and the output is groups of letter trigrams. As the last group is missing one letter, we enable padding and add the underscore symbol as the padding element.',
    sampleText: 'a;b;c;d;e;f;g;h;i;j;k;l;m;n;o;p;q;r;s;t;u;v;w;x;y;z',
    sampleResult: `[a, b, c]
[d, e, f]
[g, h, i]
[j, k, l]
[m, n, o]
[p, q, r]
[s, t, u]
[v, w, x]
[y, z, _]`,
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: ';',
      groupNumber: 3,
      itemSeparator: ',',
      leftWrap: '[',
      rightWrap: ']',
      groupSeparator: '\\n',
      deleteEmptyItems: false,
      padNonFullGroup: true,
      paddingChar: '_'
    }
  },
  {
    title: 'Convert a List to a TSV',
    description:
      'In this example, we use our list item grouper to convert a food list to tab-separated values (TSV). As spaces are chaotically used between the items of the input list, we use the item separating regular expression "\\s+" to match them. We create a TSV with three columns (three groups), separate them with a tab character, and put newlines between the groups.',
    sampleText: `beef	  buns
  cake	 	corn
 crab
dill  
fish
	kiwi 	kale

  lime  	meat
mint
   milk
  pear	plum
	  	pate
  pork	   	rice  
soup
  tuna   
  tart`,
    sampleResult: `beef	buns	cake
corn	crab	dill
fish	kiwi	kale
lime	meat	mint
milk	pear  plum
pate	pork	rice
soup	tuna	tart`,
    sampleOptions: {
      splitOperatorType: 'regex',
      splitSeparator: '\\s+',
      groupNumber: 3,
      itemSeparator: '\\t',
      leftWrap: '',
      rightWrap: '',
      groupSeparator: '\\n',
      deleteEmptyItems: true,
      padNonFullGroup: false,
      paddingChar: 'x'
    }
  }
];

export default function ChunkList({ title }: ToolComponentProps) {
  const { t } = useTranslation('list');
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
      chunkList(
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

  return (
    <ToolContent
      title={title}
      input={input}
      exampleCards={exampleCards}
      inputComponent={
        <ToolTextInput
          title={t('chunk.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('chunk.resultTitle')} value={result} />
      }
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: t('chunk.inputItemSeparator'),
          component: (
            <Box>
              {splitOperators.map((type) => (
                <SimpleRadio
                  key={type}
                  onClick={() => updateField('splitOperatorType', type)}
                  title={t(`chunk.splitOperators.${type}.title`)}
                  description={t(`chunk.splitOperators.${type}.description`)}
                  checked={values.splitOperatorType === type}
                />
              ))}
              <TextFieldWithDesc
                description={t('chunk.splitSeparatorDescription')}
                value={values.splitSeparator}
                onOwnChange={(val) => updateField('splitSeparator', val)}
              />
            </Box>
          )
        },
        {
          title: t('chunk.groupSizeAndSeparators'),
          component: (
            <Box>
              <TextFieldWithDesc
                value={values.groupNumber}
                description={t('chunk.groupNumberDescription')}
                type={'number'}
                onOwnChange={(value) =>
                  updateField('groupNumber', formatNumber(value, 1))
                }
              />
              <TextFieldWithDesc
                value={values.itemSeparator}
                description={t('chunk.itemSeparatorDescription')}
                onOwnChange={(value) => updateField('itemSeparator', value)}
              />
              <TextFieldWithDesc
                value={values.groupSeparator}
                description={t('chunk.groupSeparatorDescription')}
                onOwnChange={(value) => updateField('groupSeparator', value)}
              />
              <TextFieldWithDesc
                value={values.leftWrap}
                description={t('chunk.leftWrapDescription')}
                onOwnChange={(value) => updateField('leftWrap', value)}
              />
              <TextFieldWithDesc
                value={values.rightWrap}
                description={t('chunk.rightWrapDescription')}
                onOwnChange={(value) => updateField('rightWrap', value)}
              />
            </Box>
          )
        },
        {
          title: t('chunk.emptyItemsAndPadding'),
          component: (
            <Box>
              <CheckboxWithDesc
                title={t('chunk.deleteEmptyItems')}
                description={t('chunk.deleteEmptyItemsDescription')}
                checked={values.deleteEmptyItems}
                onChange={(value) => updateField('deleteEmptyItems', value)}
              />
              <CheckboxWithDesc
                title={t('chunk.padNonFullGroups')}
                description={t('chunk.padNonFullGroupsDescription')}
                checked={values.padNonFullGroup}
                onChange={(value) => updateField('padNonFullGroup', value)}
              />
              <TextFieldWithDesc
                value={values.paddingChar}
                description={t('chunk.paddingCharDescription')}
                onOwnChange={(value) => updateField('paddingChar', value)}
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
