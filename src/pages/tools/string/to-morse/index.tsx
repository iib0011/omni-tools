import ToolContent from '@components/ToolContent';
import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { compute } from './service';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { useTranslation } from 'react-i18next';

const initialValues = {
  dotSymbol: '.',
  dashSymbol: '-'
};

export default function ToMorse() {
  const { t } = useTranslation('string');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const computeOptions = (optionsValues: typeof initialValues, input: any) => {
    const { dotSymbol, dashSymbol } = optionsValues;
    setResult(compute(input, dotSymbol, dashSymbol));
  };

  return (
    <ToolContent
      title={t('toMorse.title')}
      initialValues={initialValues}
      compute={computeOptions}
      input={input}
      setInput={setInput}
      inputComponent={<ToolTextInput value={input} onChange={setInput} />}
      resultComponent={
        <ToolTextResult title={t('toMorse.resultTitle')} value={result} />
      }
      getGroups={({ values, updateField }) => [
        {
          title: t('toMorse.shortSignal'),
          component: (
            <TextFieldWithDesc
              description={t('toMorse.dotSymbolDescription')}
              value={values.dotSymbol}
              onOwnChange={(val) => updateField('dotSymbol', val)}
            />
          )
        },
        {
          title: t('toMorse.longSignal'),
          component: (
            <TextFieldWithDesc
              description={t('toMorse.dashSymbolDescription')}
              value={values.dashSymbol}
              onOwnChange={(val) => updateField('dashSymbol', val)}
            />
          )
        }
      ]}
    />
  );
}
