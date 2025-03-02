import { Box } from '@mui/material';
import React, { useRef, useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import ToolOptions, { GetGroupsType } from '@components/options/ToolOptions';
import SimpleRadio from '@components/options/SimpleRadio';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import ToolInputAndResult from '@components/ToolInputAndResult';
import ToolExamples, {
  CardExampleType
} from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { FormikProps } from 'formik';
import removeDuplicateLines, {
  DuplicateRemovalMode,
  DuplicateRemoverOptions,
  NewlineOption
} from './service';

// Initial values for our form
const initialValues: DuplicateRemoverOptions = {
  mode: 'all',
  newlines: 'filter',
  sortLines: false,
  trimTextLines: false
};

// Operation mode options
const operationModes = [
  {
    title: 'Remove All Duplicate Lines',
    description:
      'If this option is selected, then all repeated lines across entire text are removed, starting from the second occurrence.',
    value: 'all' as DuplicateRemovalMode
  },
  {
    title: 'Remove Consecutive Duplicate Lines',
    description:
      'If this option is selected, then only consecutive repeated lines are removed.',
    value: 'consecutive' as DuplicateRemovalMode
  },
  {
    title: 'Leave Absolutely Unique Text Lines',
    description:
      'If this option is selected, then all lines that appear more than once are removed.',
    value: 'unique' as DuplicateRemovalMode
  }
];

// Newlines options
const newlineOptions = [
  {
    title: 'Preserve All Newlines',
    description: 'Leave all empty lines in the output.',
    value: 'preserve' as NewlineOption
  },
  {
    title: 'Filter All Newlines',
    description: 'Process newlines as regular lines.',
    value: 'filter' as NewlineOption
  },
  {
    title: 'Delete All Newlines',
    description: 'Before filtering uniques, remove all newlines.',
    value: 'delete' as NewlineOption
  }
];

// Example cards for demonstration
const exampleCards: CardExampleType<typeof initialValues>[] = [
  {
    title: 'Remove Duplicate Items from List',
    description:
      'Removes duplicate items from a shopping list, keeping only the first occurrence of each item.',
    sampleText: `Apples
Bananas
Milk
Eggs
Bread
Milk
Cheese
Apples
Yogurt`,
    sampleResult: `Apples
Bananas
Milk
Eggs
Bread
Cheese
Yogurt`,
    sampleOptions: {
      ...initialValues,
      mode: 'all',
      newlines: 'filter',
      sortLines: false,
      trimTextLines: false
    }
  },
  {
    title: 'Clean Consecutive Duplicates',
    description:
      'Removes consecutive duplicates from log entries, which often happen when a system repeatedly logs the same error.',
    sampleText: `[INFO] Application started
[ERROR] Connection failed
[ERROR] Connection failed
[ERROR] Connection failed
[INFO] Retrying connection
[ERROR] Authentication error
[ERROR] Authentication error
[INFO] Connection established`,
    sampleResult: `[INFO] Application started
[ERROR] Connection failed
[INFO] Retrying connection
[ERROR] Authentication error
[INFO] Connection established`,
    sampleOptions: {
      ...initialValues,
      mode: 'consecutive',
      newlines: 'filter',
      sortLines: false,
      trimTextLines: false
    }
  },
  {
    title: 'Extract Unique Entries Only',
    description:
      'Filters a list to keep only entries that appear exactly once, removing any duplicated items entirely.',
    sampleText: `Red
Blue
Green
Blue
Yellow
Purple
Red
Orange`,
    sampleResult: `Green
Yellow
Purple
Orange`,
    sampleOptions: {
      ...initialValues,
      mode: 'unique',
      newlines: 'filter',
      sortLines: false,
      trimTextLines: false
    }
  },
  {
    title: 'Sort and Clean Data',
    description:
      'Removes duplicate items from a list, trims whitespace, and sorts the results alphabetically.',
    sampleText: `  Apple
Banana
 Cherry
Apple
   Banana
Dragonfruit
 Elderberry `,
    sampleResult: `Apple
Banana
Cherry
Dragonfruit
Elderberry`,
    sampleOptions: {
      ...initialValues,
      mode: 'all',
      newlines: 'filter',
      sortLines: true,
      trimTextLines: true
    }
  }
];

export default function RemoveDuplicateLines({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const formRef = useRef<FormikProps<typeof initialValues>>(null);

  const computeExternal = (
    optionsValues: typeof initialValues,
    inputText: string
  ) => {
    setResult(removeDuplicateLines(inputText, optionsValues));
  };

  const getGroups: GetGroupsType<typeof initialValues> = ({
    values,
    updateField
  }) => [
    {
      title: 'Operation Mode',
      component: operationModes.map(({ title, description, value }) => (
        <SimpleRadio
          key={value}
          checked={value === values.mode}
          title={title}
          description={description}
          onClick={() => updateField('mode', value)}
        />
      ))
    },
    {
      title: 'Newlines, Tabs and Spaces',
      component: [
        ...newlineOptions.map(({ title, description, value }) => (
          <SimpleRadio
            key={value}
            checked={value === values.newlines}
            title={title}
            description={description}
            onClick={() => updateField('newlines', value)}
          />
        )),
        <CheckboxWithDesc
          key="trimTextLines"
          checked={values.trimTextLines}
          title="Trim Text Lines"
          description="Before filtering uniques, remove tabs and spaces from the beginning and end of all lines."
          onChange={(checked) => updateField('trimTextLines', checked)}
        />
      ]
    },
    {
      title: 'Sort Lines',
      component: [
        <CheckboxWithDesc
          key="sortLines"
          checked={values.sortLines}
          title="Sort the Output Lines"
          description="After removing the duplicates, sort the unique lines."
          onChange={(checked) => updateField('sortLines', checked)}
        />
      ]
    }
  ];

  return (
    <Box>
      <ToolInputAndResult
        input={<ToolTextInput value={input} onChange={setInput} />}
        result={
          <ToolTextResult title={'Text without duplicates'} value={result} />
        }
      />
      <ToolOptions
        compute={computeExternal}
        getGroups={getGroups}
        initialValues={initialValues}
        input={input}
      />
      <ToolExamples
        title={title}
        exampleCards={exampleCards}
        getGroups={getGroups}
        formRef={formRef}
        setInput={setInput}
      />
    </Box>
  );
}
