import { Box } from '@mui/material';
import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { loopVideo } from './service';
import { InitialValuesType } from './types';
import ToolVideoInput from '@components/input/ToolVideoInput';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { updateNumberField } from '@utils/string';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  loops: 2
};

const validationSchema = Yup.object({
  loops: Yup.number().min(1, 'Number of loops must be greater than 1')
});

export default function Loop({ title, longDescription }: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) return;
    try {
      setLoading(true);
      const resultFile = await loopVideo(input, values);
      await setResult(resultFile);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('video:loop.loops'),
      component: (
        <Box>
          <TextFieldWithDesc
            onOwnChange={(value) =>
              updateNumberField(value, 'loops', updateField)
            }
            value={values.loops}
            label={t('video:loop.numberOfLoops')}
          />
        </Box>
      )
    }
  ];
  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={<ToolVideoInput value={input} onChange={setInput} />}
      resultComponent={
        loading ? (
          <ToolFileResult
            value={null}
            title={t('video:loop.loopingVideo')}
            loading={true}
            extension={''}
          />
        ) : (
          <ToolFileResult
            value={result}
            title={t('video:loop.resultTitle')}
            extension={'mp4'}
          />
        )
      }
      initialValues={initialValues}
      validationSchema={validationSchema}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('video:loop.toolInfo.title', { title }),
        description: longDescription
      }}
    />
  );
}
