import React, { useState } from 'react';
import ToolCodeInput from '@components/input/ToolCodeInput';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import ToolContent from '@components/ToolContent';
import { useTranslation } from 'react-i18next';
import { JsonTreeViewer } from './JsonTreeViewer';

const exampleCards: CardExampleType<{}>[] = [
  {
    title: 'Simple User Profile',
    description:
      'A basic JSON object containing primitive values (strings, numbers, booleans) and a simple list of tags.',
    sampleText: `{
  "name": "Jane Doe",
  "age": 28,
  "isAdmin": true,
  "tags": [
    "web",
    "developer",
    "design"
  ],
  "address": {
    "city": "San Francisco",
    "zipcode": 94103
  }
}`,
    sampleResult: '',
    sampleOptions: {}
  },
  {
    title: 'E-commerce Catalog',
    description:
      'A multi-level nested JSON object structure modeling products, pricing, technical specifications, and arrays of reviews.',
    sampleText: `{
  "storeName": "Tech Gadgets",
  "established": 2021,
  "products": [
    {
      "id": 101,
      "name": "Wireless Headphones",
      "price": 89.99,
      "inStock": true,
      "specifications": {
        "battery": "40 hrs",
        "bluetooth": "5.2"
      },
      "reviews": [
        {
          "rating": 5,
          "comment": "Excellent sound!"
        },
        {
          "rating": 4,
          "comment": "Good value"
        }
      ]
    },
    {
      "id": 102,
      "name": "Smart Watch",
      "price": 199.99,
      "inStock": false,
      "specifications": {
        "battery": "7 days",
        "waterproof": true
      },
      "reviews": []
    }
  ]
}`,
    sampleResult: '',
    sampleOptions: {}
  }
];

export default function JsonViewer({ title }: ToolComponentProps) {
  const { t } = useTranslation('json');
  const [input, setInput] = useState<string>('');
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const compute = (options: any, rawInput: string) => {
    if (!rawInput.trim()) {
      setParsedJson(null);
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(rawInput);
      setParsedJson(parsed);
      setError(null);
    } catch (err) {
      setParsedJson(null);
      if (err instanceof SyntaxError) {
        setError(err.message);
      } else {
        setError('Unknown error occurred while parsing JSON');
      }
    }
  };

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolCodeInput
          title={t('jsonViewer.inputTitle')}
          value={input}
          onChange={setInput}
          language="json"
        />
      }
      resultComponent={
        <JsonTreeViewer
          parsedJson={parsedJson}
          error={error}
          rawInput={input}
        />
      }
      initialValues={{}}
      getGroups={null}
      toolInfo={{
        title: t('jsonViewer.title'),
        description: t('jsonViewer.description')
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
