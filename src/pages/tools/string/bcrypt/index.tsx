import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { bcryptHash } from './service';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import { useTranslation } from 'react-i18next';
import { updateNumberField } from '@utils/string';

const initialValues: InitialValuesType = {
  saltRounds: 10
};

export default function Base64({ title }: ToolComponentProps) {
  const { t } = useTranslation('string');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = async (optionsValues: InitialValuesType, input: string) => {
    if (!input) return;

    const hashed = await bcryptHash(input, optionsValues);
    setResult(hashed);
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('bcrypt.title'),
      component: (
        <TextFieldWithDesc
          value={values.saltRounds}
          type="number"
          inputProps={{ min: 4, max: 12, step: 1 }}
          onOwnChange={(val) =>
            updateNumberField(val, 'saltRounds', updateField)
          }
          title={t('bcrypt.options.saltTitle')}
          description={t('bcrypt.options.saltDesc')}
        />
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolTextInput
          title={t('bcrypt.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('bcrypt.resultTitle')} value={result} />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      toolInfo={{
        title: t('bcrypt.toolInfo.title'),
        description: t('bcrypt.toolInfo.longDescription')
      }}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
