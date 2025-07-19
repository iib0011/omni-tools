import { Box } from '@mui/material';
import React, { useRef, useState } from 'react';
import ToolCodeInput from '@components/input/ToolCodeInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { beautifyJson } from './service';
import ToolInfo from '@components/ToolInfo';
import Separator from '@components/Separator';
import ToolExamples, {
  CardExampleType
} from '@components/examples/ToolExamples';
import { FormikProps } from 'formik';
import { ToolComponentProps } from '@tools/defineTool';
import RadioWithTextField from '@components/options/RadioWithTextField';
import SimpleRadio from '@components/options/SimpleRadio';
import { isNumber, updateNumberField } from '../../../../utils/string';
import ToolContent from '@components/ToolContent';
import { useTranslation } from 'react-i18next';

type InitialValuesType = {
  indentationType: 'tab' | 'space';
  spacesCount: number;
};

const initialValues: InitialValuesType = {
  indentationType: 'space',
  spacesCount: 2
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Beautify an Ugly JSON Array',
    description:
      'In this example, we prettify an ugly JSON array. The input data is a one-dimensional array of numbers [1,2,3] but they are all over the place. This array gets cleaned up and transformed into a more readable format where each element is on a new line with an appropriate indentation using four spaces.',
    sampleText: `[
 1,
2,3
]`,
    sampleResult: `[
    1,
    2,
    3
]`,
    sampleOptions: {
      indentationType: 'space',
      spacesCount: 4
    }
  },
  {
    title: 'Prettify a Complex JSON Object',
    description:
      'In this example, we prettify a complex JSON data structure consisting of arrays and objects. The input data is a minified JSON object with multiple data structure depth levels. To make it neat and readable, we add two spaces for indentation to each depth level, making the JSON structure clear and easy to understand.',
    sampleText: `{"names":["jack","john","alex"],"hobbies":{"jack":["programming","rock climbing"],"john":["running","racing"],"alex":["dancing","fencing"]}}`,
    sampleResult: `{
  "names": [
    "jack",
    "john",
    "alex"
  ],
  "hobbies": {
    "jack": [
      "programming",
      "rock climbing"
    ],
    "john": [
      "running",
      "racing"
    ],
    "alex": [
      "dancing",
      "fencing"
    ]
  }
}`,
    sampleOptions: {
      indentationType: 'space',
      spacesCount: 2
    }
  },
  {
    title: 'Beautify a JSON with Excessive Whitespace',
    description:
      "In this example, we show how the JSON prettify tool can handle code with excessive whitespace. The input file has many leading and trailing spaces as well as spaces within the objects. The excessive whitespace makes the file bulky and hard to read and leads to a bad impression of the programmer who wrote it. The program removes all these unnecessary spaces and creates a proper data hierarchy that's easy to work with by adding indentation via tabs.",
    sampleText: `
{
     "name":  "The Name of the Wind",
 "author"  : "Patrick Rothfuss",
     "genre"  :  "Fantasy",
     "published"   : 2007,
   "rating"    :  {
 "average"   :   4.6,
 "goodreads"         :   4.58,
      "amazon"   :  4.4
 },
      "is_fiction" : true
    }


`,
    sampleResult: `{
\t"name": "The Name of the Wind",
\t"author": "Patrick Rothfuss",
\t"genre": "Fantasy",
\t"published": 2007,
\t"rating": {
\t\t"average": 4.6,
\t\t"goodreads": 4.58,
\t\t"amazon": 4.4
\t},
\t"is_fiction": true
}`,
    sampleOptions: {
      indentationType: 'tab',
      spacesCount: 0
    }
  }
];

export default function PrettifyJson({ title }: ToolComponentProps) {
  const { t } = useTranslation('json');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: any) => {
    const { indentationType, spacesCount } = optionsValues;
    if (input) setResult(beautifyJson(input, indentationType, spacesCount));
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolCodeInput
          title={t('prettify.inputTitle')}
          value={input}
          onChange={setInput}
          language="json"
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('prettify.resultTitle')}
          value={result}
          extension={'json'}
        />
      }
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: t('prettify.indentation'),
          component: (
            <Box>
              <RadioWithTextField
                checked={values.indentationType === 'space'}
                title={t('prettify.useSpaces')}
                fieldName={'indentationType'}
                description={t('prettify.useSpacesDescription')}
                value={values.spacesCount.toString()}
                onRadioClick={() => updateField('indentationType', 'space')}
                onTextChange={(val) =>
                  updateNumberField(val, 'spacesCount', updateField)
                }
              />
              <SimpleRadio
                onClick={() => updateField('indentationType', 'tab')}
                checked={values.indentationType === 'tab'}
                description={t('prettify.useTabsDescription')}
                title={t('prettify.useTabs')}
              />
            </Box>
          )
        }
      ]}
      compute={compute}
      setInput={setInput}
      exampleCards={exampleCards}
      toolInfo={{
        title: t('prettify.toolInfo.title'),
        description: t('prettify.toolInfo.description')
      }}
    />
  );
}
