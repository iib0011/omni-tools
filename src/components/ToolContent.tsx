import React, { ReactNode, useContext, useEffect } from 'react';
import { Box, Chip, CircularProgress } from '@mui/material';
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
import { useRealtimePreview } from '../hooks/useRealtimePreview';

// ─── FormikListener (unchanged) ────────────────────────────────────────────

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

  return null;
};

// ─── RealtimePreviewListener ─────────────────────────────────────────────────
// Reads values from Formik and feeds the preview hook without prop drilling.

function RealtimePreviewListener<T extends FormikValues>({
  input,
  computePreview,
  onPreviewResult
}: {
  input: string;
  computePreview: (input: string, options: T) => string;
  onPreviewResult: (
    result: string,
    isPending: boolean,
    error: string | null
  ) => void;
}) {
  const { values } = useFormikContext<T>();

  const { result, isPending, error } = useRealtimePreview({
    input,
    options: values,
    compute: computePreview
  });

  useEffect(() => {
    onPreviewResult(result, isPending, error);
  }, [result, isPending, error, onPreviewResult]);

  return null;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface RealtimePreviewConfig {
  /**
   * Pure function that receives the text input and Formik values
   * and returns the result as a string.
   * It is only called when realtimePreview is active.
   */
  compute: (input: string, options: Record<string, unknown>) => string;
  /** Current text input of the tool (controlled by the parent component) */
  input: string;
  /**
   * Callback called with the computed result.
   * Use to update the result state in the parent component.
   */
  onResult: (result: string) => void;
}

interface ToolContentProps<Options, Input> extends ToolComponentProps {
  inputComponent?: ReactNode;
  resultComponent?: ReactNode;
  renderCustomInput?: (
    values: Options,
    setFieldValue: (fieldName: string, value: any) => void
  ) => ReactNode;
  initialValues: Options;
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
  /** Quando fornecido, ativa o preview em tempo real para esta tool */
  realtimePreview?: RealtimePreviewConfig;
}

// ─── Preview status indicator ───────────────────────────────────────────────

function PreviewStatusChip({
  isPending,
  error
}: {
  isPending: boolean;
  error: string | null;
}) {
  if (!isPending && !error) return null;

  if (isPending) {
    return (
      <Box display="flex" justifyContent="flex-end" mb={0.5}>
        <Chip
          size="small"
          icon={<CircularProgress size={10} />}
          label="Computing…"
          variant="outlined"
          sx={{ fontSize: 11, height: 20 }}
        />
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="flex-end" mb={0.5}>
      <Chip
        size="small"
        label={error}
        color="error"
        variant="outlined"
        sx={{ fontSize: 11, height: 20, maxWidth: 300 }}
      />
    </Box>
  );
}

// ─── ToolContent ─────────────────────────────────────────────────────────────

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
  verticalGroups,
  realtimePreview
}: ToolContentProps<T, I>) {
  const [previewIsPending, setPreviewIsPending] = React.useState(false);
  const [previewError, setPreviewError] = React.useState<string | null>(null);

  const handlePreviewResult = React.useCallback(
    (result: string, isPending: boolean, error: string | null) => {
      setPreviewIsPending(isPending);
      setPreviewError(error);
      if (!isPending && !error) {
        realtimePreview?.onResult(result);
      }
    },
    [realtimePreview]
  );

  return (
    <Box>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={() => {}}
      >
        {({ values, setFieldValue }) => (
          <>
            {realtimePreview && (
              <>
                <PreviewStatusChip
                  isPending={previewIsPending}
                  error={previewError}
                />
                <RealtimePreviewListener
                  input={realtimePreview.input}
                  computePreview={
                    realtimePreview.compute as (
                      input: string,
                      options: T
                    ) => string
                  }
                  onPreviewResult={handlePreviewResult}
                />
              </>
            )}

            <ToolInputAndResult
              input={
                inputComponent ??
                (renderCustomInput && renderCustomInput(values, setFieldValue))
              }
              result={resultComponent}
            />

            <FormikListenerComponent<T>
              compute={compute}
              input={input}
              onValuesChange={onValuesChange}
            />

            <ToolOptions getGroups={getGroups} vertical={verticalGroups} />

            {toolInfo?.title && toolInfo?.description && (
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
        )}
      </Formik>
    </Box>
  );
}
