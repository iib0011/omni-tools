import { Box } from '@mui/material';
import React, { useState, useCallback } from 'react';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from 'components/options/TextFieldWithDesc';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolMultipleImageInput, {
  MultiImageInput
} from '@components/input/ToolMultipleImageInput';
import { InitialValuesType } from './types';
import { updateNumberField } from '@utils/string';
import { useTranslation } from 'react-i18next';
import { imagesToGif } from './service';
import { debounce } from 'lodash';

const initialValues: InitialValuesType = {
  frameDelay: 500
};

export default function ImagesToGif({ title }: ToolComponentProps) {
  const { t } = useTranslation('video');
  const [input, setInput] = useState<MultiImageInput[]>([]);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (
    optionsValues: InitialValuesType,
    input: MultiImageInput[]
  ) => {
    if (!input || input.length === 0) return;
    try {
      const convertedGif = await imagesToGif(
        input.map((item) => item.file),
        optionsValues
      );
      setResult(convertedGif);
    } catch (error) {
      console.error('Error cropping video:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedCompute = useCallback(debounce(compute, 1000), []);

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolMultipleImageInput
          value={input}
          onChange={setInput}
          type="image"
          accept={['image/*']}
          title={t('gif.imagesToGif.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('gif.imagesToGif.resultTitle')}
          value={result}
          extension="gif"
          loading={loading}
          loadingText={t('gif.imagesToGif.loadingText')}
        />
      }
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: t('gif.imagesToGif.frameOptions'),
          component: (
            <Box>
              <TextFieldWithDesc
                name="frameDelay"
                type="number"
                inputProps={{ min: 50, max: 10000, step: 50 }}
                description={t('gif.imagesToGif.frameDelayDescription')}
                onOwnChange={(value) => {
                  const clamped = Math.min(
                    10000,
                    Math.max(50, Number(value))
                  ).toString();
                  updateNumberField(clamped, 'frameDelay', updateField);
                }}
                value={values.frameDelay}
              />
            </Box>
          )
        }
      ]}
      compute={debouncedCompute}
      setInput={setInput}
    />
  );
}
