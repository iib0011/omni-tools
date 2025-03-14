import React, { ReactNode, useContext } from 'react';
import { Box } from '@mui/material';
import { Formik, FormikValues, useFormikContext } from 'formik';
import ToolOptions, { GetGroupsType } from '@components/options/ToolOptions';
import ToolInputAndResult from '@components/ToolInputAndResult';
import ToolInfo from '@components/ToolInfo';
import Separator from '@components/Separator';
import ToolExamples, {
  CardExampleType
} from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { CustomSnackBarContext } from '../contexts/CustomSnackBarContext';

const FormikListenerComponent = <T,>({
  input,
  compute
}: {
  input: any;
  compute: (optionsValues: T, input: any) => void;
}) => {
  const { values } = useFormikContext<T>();
  const { showSnackBar } = useContext(CustomSnackBarContext);

  React.useEffect(() => {
    try {
      compute(values, input);
    } catch (exception: unknown) {
      if (exception instanceof Error) showSnackBar(exception.message, 'error');
      else console.error(exception);
    }
  }, [values, input, showSnackBar]);

  return null; // This component doesn't render anything
};

interface ToolContentProps<T, I> extends ToolComponentProps {
  // Input/Output components
  inputComponent?: ReactNode;
  resultComponent: ReactNode;

  renderCustomInput?: (
    values: T,
    setFieldValue: (fieldName: string, value: any) => void
  ) => ReactNode;

  // Tool options
  initialValues: T;
  getGroups: GetGroupsType<T> | null;

  // Computation function
  compute: (optionsValues: T, input: I) => void;

  // Tool info (optional)
  toolInfo?: {
    title: string;
    description?: string;
  };

  // Input value to pass to the compute function
  input?: I;

  exampleCards?: CardExampleType<T>[];
  setInput?: React.Dispatch<React.SetStateAction<I>>;

  // Validation schema (optional)
  validationSchema?: any;
}

export default function ToolContent<T extends FormikValues, I>({
  title,
  inputComponent,
  resultComponent,
  initialValues,
  getGroups,
  compute,
  toolInfo,
  exampleCards,
  input,
  setInput,
  validationSchema,
  renderCustomInput
}: ToolContentProps<T, I>) {
  return (
    <Box>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={() => {}}
      >
        {({ values, setFieldValue }) => {
          return (
            <>
              <ToolInputAndResult
                input={
                  inputComponent ??
                  (renderCustomInput &&
                    renderCustomInput(values, setFieldValue))
                }
                result={resultComponent}
              />
              <FormikListenerComponent<T> compute={compute} input={input} />
              <ToolOptions getGroups={getGroups} />

              {toolInfo && toolInfo.title && toolInfo.description && (
                <ToolInfo
                  title={toolInfo.title}
                  description={toolInfo.description}
                />
              )}

              {exampleCards && exampleCards.length > 0 && (
                <>
                  <Separator backgroundColor="#5581b5" margin="50px" />
                  <ToolExamples
                    title={title}
                    exampleCards={exampleCards}
                    getGroups={getGroups}
                    setInput={setInput}
                  />
                </>
              )}
            </>
          );
        }}
      </Formik>
    </Box>
  );
}
