import React, { useRef, useState, ReactNode, useEffect } from 'react';
import { Box } from '@mui/material';
import { FormikProps, FormikValues } from 'formik';
import ToolOptions, {
  GetGroupsType,
  UpdateField
} from '@components/options/ToolOptions';
import ToolInputAndResult from '@components/ToolInputAndResult';
import ToolInfo from '@components/ToolInfo';
import Separator from '@components/Separator';
import ToolExamples, {
  CardExampleType
} from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';

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
  const formRef = useRef<FormikProps<T>>(null);

  const [initialized, forceUpdate] = useState(0);
  useEffect(() => {
    if (formRef.current && !initialized) {
      forceUpdate((n) => n + 1);
    }
  }, [initialized]);
  return (
    <Box>
      <ToolInputAndResult
        input={
          inputComponent ??
          (renderCustomInput &&
            formRef.current &&
            renderCustomInput(
              formRef.current.values,
              formRef.current.setFieldValue
            ))
        }
        result={resultComponent}
      />

      <ToolOptions
        formRef={formRef}
        compute={compute}
        getGroups={getGroups}
        initialValues={initialValues}
        input={input}
        validationSchema={validationSchema}
      />

      {toolInfo && toolInfo.title && toolInfo.description && (
        <ToolInfo title={toolInfo.title} description={toolInfo.description} />
      )}

      {exampleCards && exampleCards.length > 0 && (
        <>
          <Separator backgroundColor="#5581b5" margin="50px" />
          <ToolExamples
            title={title}
            exampleCards={exampleCards}
            getGroups={getGroups}
            formRef={formRef}
            setInput={setInput}
          />
        </>
      )}
    </Box>
  );
}
