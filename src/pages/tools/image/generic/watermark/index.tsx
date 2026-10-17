import { Box } from '@mui/material';
import React, { useState, useContext } from 'react';
import * as Yup from 'yup';
import ToolMultipleImageInput, {
  MultiImageInput
} from '@components/input/ToolMultipleImageInput';
import ToolMultiFileResult from '@components/result/ToolMultiFileResult';
import ColorSelector from '@components/options/ColorSelector';
import ToolFileResult from '@components/result/ToolFileResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import SimpleRadio from '@components/options/SimpleRadio';
import { watermarkImages } from './service';
import { InitialValuesType } from './types';
import { CustomSnackBarContext } from 'contexts/CustomSnackBarContext';
import { useTranslation } from 'react-i18next';
import { getFileExtension } from '@utils/file';

const initialValues: InitialValuesType = {
  filename: true,
  watermark: 'OMNITOOLS',
  watermarkOpacity: 0.35,
  fontSize: 32,
  position: 'bottom-right',
  color: '#ffffff'
};

const validationSchema = Yup.object({
  watermarkOpacity: Yup.number()
    .min(0, 'Opacity must be between 0 and 1')
    .max(1, 'Opacity must be between 0 and 1')
    .required('Opacity is required'),
  fontSize: Yup.number()
    .min(8, 'Font size must be at least 8px')
    .max(512, 'Font size is too large')
    .required('Font size is required'),
  color: Yup.string().required('Color is required')
});

export default function Watermark({ title }: ToolComponentProps) {
  const { t } = useTranslation('image');
  const [input, setInput] = useState<MultiImageInput[]>([]);
  const [result, setResult] = useState<File[]>([]);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const compute = async (
    optionsValues: InitialValuesType,
    input: MultiImageInput[]
  ) => {
    if (!input || input.length === 0) return;

    try {
      setIsProcessing(true);

      const output = await watermarkImages(
        input.map((img) => img.file),
        optionsValues
      );

      if (!output) {
        showSnackBar(t('watermark.failedToProcess'), 'error');
        return;
      } else {
        setResult(output.results);
        setZipFile(output.zipFile);
      }
    } catch (error) {
      showSnackBar(`Error converting files: ${error}`, 'error');
      setZipFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('watermark.options.watermarkTitle'),
      component: (
        <Box>
          <Box mb={3}>
            <SimpleRadio
              onClick={() => updateField('filename', true)}
              checked={values.filename === true}
              title={t('watermark.options.filenameWatermarkTitle')}
              description={t('watermark.options.filenameWatermarkDesc')}
            />
            <SimpleRadio
              onClick={() => updateField('filename', false)}
              checked={values.filename === false}
              title={t('watermark.options.customStringWatermarkTitle')}
              description={t('watermark.options.customStringWatermarkDesc')}
            />
          </Box>
          {!values.filename && (
            <TextFieldWithDesc
              value={values.watermark}
              onOwnChange={(val) => updateField('watermark', val)}
              description={t('watermark.options.watermark')}
              inputProps={{
                'data-testid': 'watermark-input',
                type: 'string'
              }}
            />
          )}
        </Box>
      )
    },
    {
      title: t('watermark.options.styleTitle'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={String(values.watermarkOpacity)}
            onOwnChange={(val) => updateField('watermarkOpacity', Number(val))}
            description={t('watermark.options.opacity')}
            inputProps={{
              'data-testid': 'opacity-input',
              type: 'number',
              min: 0,
              max: 1,
              step: 0.05
            }}
          />
          <TextFieldWithDesc
            value={String(values.fontSize)}
            onOwnChange={(val) => updateField('fontSize', Number(val))}
            description={t('watermark.options.fontSize')}
            inputProps={{
              'data-testid': 'font-size-input',
              type: 'number',
              min: 8,
              max: 512,
              step: 1
            }}
          />
          <ColorSelector
            value={values.color}
            onColorChange={(val) => updateField('color', val)}
            description={t('watermark.options.color')}
            inputProps={{
              'data-testid': 'color-input'
            }}
          />
        </Box>
      )
    },
    {
      title: t('watermark.options.positionTitle'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('position', 'bottom-right')}
            checked={values.position === 'bottom-right'}
            title={t('watermark.options.position.bottomRight')}
          />
          <SimpleRadio
            onClick={() => updateField('position', 'bottom-left')}
            checked={values.position === 'bottom-left'}
            title={t('watermark.options.position.bottomLeft')}
          />
          <SimpleRadio
            onClick={() => updateField('position', 'top-right')}
            checked={values.position === 'top-right'}
            title={t('watermark.options.position.topRight')}
          />
          <SimpleRadio
            onClick={() => updateField('position', 'top-left')}
            checked={values.position === 'top-left'}
            title={t('watermark.options.position.topLeft')}
          />
          <SimpleRadio
            onClick={() => updateField('position', 'center')}
            checked={values.position === 'center'}
            title={t('watermark.options.position.center')}
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
      validationSchema={validationSchema}
      inputComponent={
        <ToolMultipleImageInput
          value={input}
          type={'image'}
          onChange={setInput}
          accept={['image/*']}
          title={t('watermark.inputTitle')}
        />
      }
      resultComponent={
        zipFile ? (
          <ToolMultiFileResult
            title={t('watermark.outputTitle')}
            value={result}
            zipFile={zipFile}
            loading={isProcessing}
          />
        ) : (
          <ToolFileResult
            title={t('watermark.outputTitle')}
            value={result[0] ?? null}
            extension={result[0] ? getFileExtension(result[0].name) : undefined}
            loading={isProcessing}
          />
        )
      }
      toolInfo={{
        title: t('watermark.toolInfo.title'),
        description: t('watermark.toolInfo.longDescription')
      }}
    />
  );
}
