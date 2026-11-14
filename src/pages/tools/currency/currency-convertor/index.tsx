import { Box } from '@mui/material';
import React, { useRef, useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import CurrencyWorkspace from './CurrencyWorkspace';
import { getCurrency } from './currencies';
import { main } from './service';
import { ConversionRow, InitialValuesType } from './types';

const initialValues: InitialValuesType = {
  from: 'USD',
  targets: ['INR', 'EUR', 'GBP'],
  precision: 2,
  historical: false,
  date: '2010-01-04',
  includeCrypto: false,
  showFlags: true
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Convert USD to several currencies',
    description:
      'This example converts 100 US dollars to Indian rupees, euros and British pounds at once',
    sampleText: '100',
    sampleResult: '→ INR, EUR, GBP (at live rates)',
    sampleOptions: initialValues
  }
];

export default function CurrencyConvertor({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [rows, setRows] = useState<ConversionRow[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const latestRequest = useRef(0);

  const compute = (values: InitialValuesType, input: string) => {
    // Only the most recent request may update the screen
    const id = ++latestRequest.current;
    setLoading(true);
    main(input, values)
      .then((result) => {
        if (id !== latestRequest.current) return;
        setRows(result);
        setError('');
      })
      .catch((e) => {
        if (id !== latestRequest.current) return;
        setRows(values.targets.map((code) => ({ code, amount: '' })));
        setError(
          e instanceof Error ? e.message : 'Could not load exchange rates'
        );
      })
      .finally(() => {
        if (id === latestRequest.current) setLoading(false);
      });
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: 'Display',
      component: (
        <Box>
          <TextFieldWithDesc
            type="number"
            value={values.precision}
            onOwnChange={(value) =>
              updateField(
                'precision',
                Math.min(8, Math.max(0, parseInt(value, 10) || 0))
              )
            }
            inputProps={{ min: 0, max: 8 }}
            description="Decimal places"
          />
        </Box>
      )
    },
    {
      title: 'Historical rates',
      component: (
        <Box>
          <CheckboxWithDesc
            title="Use a past date"
            description="Convert with the exchange rate of a specific day"
            checked={values.historical}
            onChange={(value) => updateField('historical', value)}
          />
          <TextFieldWithDesc
            type="date"
            value={values.date}
            disabled={!values.historical}
            onOwnChange={(value) => updateField('date', value)}
            inputProps={{ max: new Date().toISOString().slice(0, 10) }}
            description="Rate date"
          />
        </Box>
      )
    },
    {
      title: 'Currency list',
      component: (
        <Box>
          <CheckboxWithDesc
            title="Include cryptocurrencies"
            checked={values.includeCrypto}
            onChange={(value) => {
              updateField('includeCrypto', value);
              if (!value) {
                // Drop crypto from the lists, they are no longer selectable
                const isCrypto = (code: string) =>
                  getCurrency(code).kind === 'crypto';
                updateField(
                  'targets',
                  values.targets.filter((code) => !isCrypto(code))
                );
                if (isCrypto(values.from)) updateField('from', 'USD');
              }
            }}
          />
          <CheckboxWithDesc
            title="Show flags"
            checked={values.showFlags}
            onChange={(value) => updateField('showFlags', value)}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      renderCustomInput={(values, setFieldValue) => (
        <CurrencyWorkspace
          values={values}
          setFieldValue={setFieldValue}
          input={input}
          setInput={setInput}
          rows={rows}
          loading={loading}
          error={error}
        />
      )}
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
