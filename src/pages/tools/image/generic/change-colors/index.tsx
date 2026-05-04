import { Box } from '@mui/material';
import React, { useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import ColorSelector from '@components/options/ColorSelector';
import { updateNumberField } from '@utils/string';
import Color from 'color';
import TextFieldWithDesc from 'components/options/TextFieldWithDesc';
import SimpleRadio from '@components/options/SimpleRadio';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolImageInput from '@components/input/ToolImageInput';
import { processImage } from './service';
import { InitialValuesType } from './types';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  fromColor: '#ffffffff',
  toColor: '#000000ff',
  similarity: 10
};

const validationSchema = Yup.object({
  similarity: Yup.number()
    .min(0, 'Similarity must be between 0 and 100')
    .max(100, 'Similarity must be between 0 and 100')
    .required()
});

export default function ChangeColorsInImage({ title }: ToolComponentProps) {
  const { t } = useTranslation('image');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const compute = async (
    optionsValues: InitialValuesType,
    input: File | null
  ) => {
    if (!input) return;
    const { fromColor, toColor, similarity } = optionsValues;
    let fromRgb: [number, number, number, number];
    let toRgb: [number, number, number, number];
    try {
      fromRgb = [
        ...Color(fromColor).rgb().array(),
        Color(fromColor).alpha() * 255
      ] as [number, number, number, number];
      toRgb = [
        ...Color(toColor).rgb().array(),
        Color(toColor).alpha() * 255
      ] as [number, number, number, number];
    } catch (err) {
      return;
    }

    setIsProcessing(true);
    try {
      const image = await processImage(input, fromRgb, toRgb, similarity);
      setResult(image);
    } finally {
      setIsProcessing(false);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('changeColors.fromColor.title'),
      component: (
        <Box>
          <SimpleRadio
            title={t('changeColors.fromColor.transparentOption')}
            checked={values.fromColor === '#00000000'}
            onClick={() => updateField('fromColor', '#00000000')}
          />
          <SimpleRadio
            title={t('changeColors.fromColor.colorOption')}
            checked={values.fromColor !== '#00000000'}
            onClick={() => updateField('fromColor', '#ffffffff')}
          />
          {values.fromColor !== '#00000000' && (
            <ColorSelector
              value={values.fromColor}
              onColorChange={(val) => updateField('fromColor', val)}
              description={t('changeColors.fromColor.selectorDescription')}
              inputProps={{ 'data-testid': 'from-color-input' }}
            />
          )}
          <TextFieldWithDesc
            value={values.similarity}
            onOwnChange={(val) =>
              updateNumberField(val, 'similarity', updateField)
            }
            description={t('changeColors.fromColor.similarityDescription')}
          />
        </Box>
      )
    },
    {
      title: t('changeColors.toColor.title'),
      component: (
        <Box>
          <SimpleRadio
            title={t('changeColors.toColor.transparentOption')}
            checked={values.toColor === '#00000000'}
            onClick={() => updateField('toColor', '#00000000')}
          />
          <SimpleRadio
            title={t('changeColors.toColor.colorOption')}
            checked={values.toColor !== '#00000000'}
            onClick={() => updateField('toColor', '#000000ff')}
          />
          {values.toColor !== '#00000000' && (
            <ColorSelector
              value={values.toColor}
              onColorChange={(val) => updateField('toColor', val)}
              description={t('changeColors.toColor.selectorDescription')}
              inputProps={{ 'data-testid': 'to-color-input' }}
            />
          )}
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      input={input}
      validationSchema={validationSchema}
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/*']}
          title={t('changeColors.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('changeColors.resultTitle')}
          value={result}
          loading={isProcessing}
        />
      }
    />
  );
}
