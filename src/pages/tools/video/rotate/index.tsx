import { Box } from '@mui/material';
import { useCallback, useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { updateNumberField } from '@utils/string';
import { debounce } from 'lodash';
import ToolVideoInput from '@components/input/ToolVideoInput';
import { rotateVideo } from './service';

export const initialValues = {
  rotation: 90
};

export const validationSchema = Yup.object({
  rotation: Yup.number()
    .oneOf([0, 90, 180, 270], 'Rotation must be 0, 90, 180, or 270 degrees')
    .required('Rotation is required')
});

export default function RotateVideo({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compute = async (
    optionsValues: typeof initialValues,
    input: File | null
  ) => {
    if (!input) return;

    try {
      await validationSchema.validate(optionsValues);
    } catch (validationError) {
      setError((validationError as Yup.ValidationError).message);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rotatedFile = await rotateVideo(input, optionsValues.rotation);
      setResult(rotatedFile);
    } catch (error) {
      console.error('Error rotating video:', error);
      setError('Failed to rotate video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const debouncedCompute = useCallback(debounce(compute, 1000), []);

  const getGroups: GetGroupsType<typeof initialValues> = ({
    values,
    updateField
  }) => [
    {
      title: 'Rotation',
      component: (
        <Box>
          <TextFieldWithDesc
            onOwnChange={(value) =>
              updateNumberField(value, 'rotation', updateField)
            }
            value={values.rotation}
            label={'Rotation (degrees)'}
            helperText={error || 'Valid values: 0, 90, 180, 270'}
            error={!!error}
            sx={{ mb: 2, backgroundColor: 'white' }}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      renderCustomInput={(_, setFieldValue) => (
        <ToolVideoInput
          value={input}
          onChange={setInput}
          accept={['video/mp4', 'video/webm', 'video/ogg']}
          title={'Input Video'}
        />
      )}
      resultComponent={
        loading ? (
          <ToolFileResult
            title={'Rotating Video'}
            value={null}
            loading={true}
            extension={''}
          />
        ) : (
          <ToolFileResult
            title={'Rotated Video'}
            value={result}
            extension={'mp4'}
          />
        )
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={debouncedCompute}
      setInput={setInput}
      validationSchema={validationSchema}
    />
  );
}
