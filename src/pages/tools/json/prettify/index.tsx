import { Box } from '@mui/material';
import React, { useRef, useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
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
        <ToolTextInput title={'Input JSON'} value={input} onChange={setInput} />
      }
      resultComponent={<ToolTextResult title={'Pretty JSON'} value={result} />}
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: 'Indentation',
          component: (
            <Box>
              <RadioWithTextField
                checked={values.indentationType === 'space'}
                title={'Use Spaces'}
                fieldName={'indentationType'}
                description={'Indent output with spaces'}
                value={values.spacesCount.toString()}
                onRadioClick={() => updateField('indentationType', 'space')}
                onTextChange={(val) =>
                  updateNumberField(val, 'spacesCount', updateField)
                }
              />
              <SimpleRadio
                onClick={() => updateField('indentationType', 'tab')}
                checked={values.indentationType === 'tab'}
                description={'Indent output with tabs.'}
                title={'Use Tabs'}
              />
            </Box>
          )
        }
      ]}
      compute={compute}
      setInput={setInput}
      exampleCards={exampleCards}
      toolInfo={{
        title: 'What Is a JSON Prettifier?',
        description:
          'This tool adds consistent formatting to the data in JavaScript Object Notation (JSON) format. This transformation makes the JSON code more readable, making it easier to understand and edit. The program parses the JSON data structure into tokens and then reformats them by adding indentation and line breaks. If the data is hierarchial, then it adds indentation at the beginning of lines to visually show the depth of the JSON and adds newlines to break long single-line JSON arrays into multiple shorter, more readable ones. Additionally, this utility can remove unnecessary spaces and tabs from your JSON code (especially leading and trailing whitespaces), making it more compact. You can choose the line indentation method in the options: indent with spaces or indent with tabs. When using spaces, you can also specify how many spaces to use for each indentation level (usually 2 or 4 spaces). '
      }}
    />
  );
}
