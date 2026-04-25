import { Box } from '@mui/material';
import { useState, useCallback } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import ToolImageInput from '@components/input/ToolImageInput';
import { t } from 'i18next';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { updateNumberField } from '@utils/string';
import { splitImagesToPDF, fromPts, toPts } from './service';
import { debounce } from 'lodash';
import { PageSizes } from 'pdf-lib';
import ToolFileResult from '@components/result/ToolFileResult';
import SelectWithDesc from '@components/options/SelectWithDesc';

const initialValues: InitialValuesType = {
  pageFormat: 'A4',
  pageWidth: 210,
  pageHeight: 297,
  pxPerSquareQuantity: 1620,
  squareQuantity: 20,
  unitsPerOneSquare: fromPts(72, 'mm'),
  unitKind: 'mm',
  padding: 5
};

export default function Split({ title, longDescription }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) return;

    setIsProcessing(true);

    try {
      const pdfFile = await splitImagesToPDF(input, values);
      setResult(pdfFile);
    } finally {
      setIsProcessing(false);
    }
  };

  const debouncedCompute = useCallback(debounce(compute, 1000), []);

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('image:split.pageParameters.title'),
      component: (
        <Box>
          <SelectWithDesc
            selected={values.pageFormat}
            onChange={(val) => {
              updateField('pageFormat', val as keyof typeof PageSizes);
            }}
            description={t('image:split.pageParameters.selectPageFormat')}
            options={Object.keys(PageSizes).map((key) => ({
              value: key,
              label: key
            }))}
          />
          <TextFieldWithDesc
            name="padding"
            type="number"
            inputProps={{ min: 0, step: 1 }}
            description={t('image:split.pageParameters.padding.description')}
            onOwnChange={(value) => {
              updateNumberField(value, 'padding', updateField);
            }}
            value={values.padding}
          />
        </Box>
      )
    },
    {
      title: t('image:split.scaleParameters.title'),
      component: (
        <Box>
          <TextFieldWithDesc
            name="pxPerSquareQuantity"
            type="number"
            inputProps={{ min: 1, step: 1 }}
            description={t(
              'image:split.scaleParameters.pxPerSquareQuantity.description'
            )}
            onOwnChange={(value) => {
              updateNumberField(value, 'pxPerSquareQuantity', updateField);
            }}
            value={values.pxPerSquareQuantity}
          />
          <TextFieldWithDesc
            name="squareQuantity"
            type="number"
            inputProps={{ min: 1, step: 1 }}
            description={t(
              'image:split.scaleParameters.squareQuantity.description'
            )}
            onOwnChange={(value) => {
              updateNumberField(value, 'squareQuantity', updateField);
            }}
            value={values.squareQuantity}
          />
          <TextFieldWithDesc
            name="mmPerOneSquare"
            type="number"
            inputProps={{ min: 1, step: 1 }}
            description={t(
              'image:split.scaleParameters.unitsPerOneSquare.description'
            )}
            onOwnChange={(value) => {
              updateNumberField(value, 'unitsPerOneSquare', updateField);
            }}
            value={values.unitsPerOneSquare}
          />
        </Box>
      )
    },
    {
      title: t('image:split.units.title'),
      component: (
        <Box>
          <SelectWithDesc
            selected={values.unitKind}
            onChange={(newUnitKind) => {
              updateField('unitKind', newUnitKind);
              updateField('unitsPerOneSquare', fromPts(72, newUnitKind));
              updateField(
                'padding',
                Math.round(fromPts(toPts(5, 'mm'), newUnitKind) * 100) / 100
              );
            }}
            description={t('image:split.units.select')}
            options={[
              { value: 'pt', label: t('image:split.units.options.pt') },
              { value: 'mm', label: t('image:split.units.options.mm') },
              { value: 'in', label: t('image:split.units.options.in') }
            ]}
          />
        </Box>
      )
    }
  ];
  return (
    <ToolContent
      title={t('image:split.title')}
      input={input}
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/*']}
          title={t('image:split.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('image:split.resultTitle')}
          value={result}
          loading={isProcessing}
          loadingText={t('image:split.loadingText')}
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={debouncedCompute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
