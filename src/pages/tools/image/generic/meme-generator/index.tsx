import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ColorSelector from '@components/options/ColorSelector';
import { generateMeme } from './service';
import { InitialValuesType } from './types';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  topText: '',
  bottomText: '',
  fontSize: 10,
  textColor: '#FFFFFF',
  strokeColor: '#000000'
};

export default function MemeGenerator({ title }: ToolComponentProps) {
  const { t } = useTranslation('image');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const compute = async (optionsValues: InitialValuesType, input: any) => {
    if (!input) return;
    setResult(await generateMeme(input, optionsValues));
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('memeGenerator.textOptions'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.topText}
            onOwnChange={(val) => updateField('topText', val)}
            description={t('memeGenerator.topTextDescription')}
            label={t('memeGenerator.topText')}
            fullWidth
            margin="normal"
          />
          <TextFieldWithDesc
            value={values.bottomText}
            onOwnChange={(val) => updateField('bottomText', val)}
            description={t('memeGenerator.bottomTextDescription')}
            label={t('memeGenerator.bottomText')}
            fullWidth
            margin="normal"
          />
        </Box>
      )
    },
    {
      title: t('memeGenerator.styleOptions'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={String(values.fontSize)}
            onOwnChange={(val) => updateField('fontSize', Number(val))}
            description={t('memeGenerator.fontSizeDescription')}
            label={t('memeGenerator.fontSize')}
            inputProps={{
              type: 'number',
              min: 1,
              max: 50
            }}
            fullWidth
            margin="normal"
          />
          <ColorSelector
            value={values.textColor}
            onColorChange={(val) => updateField('textColor', val)}
            label={t('memeGenerator.textColor')}
            description={t('memeGenerator.textColorDescription')}
            fullWidth
            margin="normal"
          />
          <ColorSelector
            value={values.strokeColor}
            onColorChange={(val) => updateField('strokeColor', val)}
            label={t('memeGenerator.strokeColor')}
            description={t('memeGenerator.strokeColorDescription')}
            fullWidth
            margin="normal"
          />
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
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif']}
          title={t('memeGenerator.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('memeGenerator.resultTitle')}
          value={result}
          extension={input?.name.split('.').pop() || 'png'}
        />
      }
      toolInfo={{
        title: t('memeGenerator.toolInfo.title'),
        description: t('memeGenerator.toolInfo.description')
      }}
    />
  );
}
