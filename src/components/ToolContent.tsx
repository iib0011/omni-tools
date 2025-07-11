import React, { ReactNode, useContext, useEffect } from 'react';
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
  compute,
  onValuesChange
}: {
  input: any;
  compute: (optionsValues: T, input: any) => void;
  onValuesChange?: (values: T) => void;
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

  useEffect(() => {
    onValuesChange?.(values);
  }, [onValuesChange, values]);
  return null; // This component doesn't render anything
};

interface ToolContentProps<Options, Input> extends ToolComponentProps {
  inputComponent?: ReactNode;
  resultComponent?: ReactNode;
  renderCustomInput?: (
    values: Options,
    setFieldValue: (fieldName: string, value: any) => void
  ) => ReactNode;
  initialValues: Options;
  /**
   * should return non-empty array or null
   */
  getGroups: GetGroupsType<Options> | null;
  compute: (optionsValues: Options, input: Input) => void;
  toolInfo?: {
    title: string;
    description?: string;
  };
  input?: Input;
  exampleCards?: CardExampleType<Options>[];
  setInput?: React.Dispatch<React.SetStateAction<Input>>;
  validationSchema?: any;
  onValuesChange?: (values: Options) => void;
  verticalGroups?: boolean;
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
  renderCustomInput,
  onValuesChange,
  verticalGroups
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
              <FormikListenerComponent<T>
                compute={compute}
                input={input}
                onValuesChange={onValuesChange}
              />
              <ToolOptions getGroups={getGroups} vertical={verticalGroups} />

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
