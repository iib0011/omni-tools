import React, { useState, useMemo, useEffect } from 'react';
import ToolImageInput from '@components/input/ToolImageInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { changeOpacity } from './service';
import ToolContent from '@components/ToolContent';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import SelectWithDesc from '@components/options/SelectWithDesc';
import ColorSelector from '@components/options/ColorSelector';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { updateNumberField } from '@utils/string';
import { Box } from '@mui/material';
import SimpleRadio from '@components/options/SimpleRadio';
import { InitialValuesType } from './types';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { getImageDimensions, getMaxAreaPosition } from '@utils/image';

const getInitialValues = (
  width: number,
  height: number
): InitialValuesType => ({
  opacity: 0.5,
  mode: 'solid',
  gradientType: 'linear',
  gradientDirection: 'inside-out',
  backgroundMode: 'transparent',
  backgroundColor: '#ffffff',
  areaLeft: 0,
  areaTop: 0,
  areaWidth: width,
  areaHeight: height
});
export default function ChangeOpacity({ title }: ToolComponentProps) {
  const { t } = useTranslation('image');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    if (!input) {
      setImageSize({ width: 0, height: 0 });
      return;
    }

    getImageDimensions(input).then(setImageSize);
  }, [input]);

  const initialValues = useMemo(
    () => getInitialValues(imageSize.width, imageSize.height),
    [imageSize.width, imageSize.height]
  );

  const compute = (values: InitialValuesType, input: any) => {
    if (input) {
      changeOpacity(input, values).then(setResult);
    }
  };

  const debouncedCompute = useMemo(() => debounce(compute, 1000), []);

  useEffect(() => {
    return () => {
      debouncedCompute.cancel();
    };
  }, [debouncedCompute]);

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('changeOpacity.options.opacitySettings'),
      component: (
        <Box>
          <TextFieldWithDesc
            description={t('changeOpacity.options.opacityDescription')}
            value={values.opacity}
            onOwnChange={(val) =>
              updateNumberField(val, 'opacity', updateField)
            }
            type="number"
            inputProps={{ step: 0.1, min: 0, max: 1 }}
          />
          <SimpleRadio
            onClick={() => updateField('mode', 'solid')}
            checked={values.mode === 'solid'}
            description={t('changeOpacity.options.solidOpacityDescription')}
            title={t('changeOpacity.options.solidOpacityTitle')}
          />
          <SimpleRadio
            onClick={() => updateField('mode', 'gradient')}
            checked={values.mode === 'gradient'}
            description={t('changeOpacity.options.gradientOpacityDescription')}
            title={t('changeOpacity.options.gradientOpacityTitle')}
          />

          {values.mode === 'gradient' && (
            <Box mt={2}>
              <SelectWithDesc
                selected={values.gradientType}
                options={[
                  {
                    label: t('changeOpacity.options.linearOpacity'),
                    value: 'linear'
                  },
                  {
                    label: t('changeOpacity.options.radialOpacity'),
                    value: 'radial'
                  }
                ]}
                onChange={(value) => {
                  updateField('gradientType', value);

                  if (value === 'linear') {
                    updateField('gradientDirection', 'left-to-right');
                  } else {
                    updateField('gradientDirection', 'inside-out');
                  }
                }}
                description={t('changeOpacity.options.gradientType')}
              />
            </Box>
          )}

          {values.gradientType === 'radial' && (
            <Box mt={2}>
              <SelectWithDesc
                selected={values.gradientDirection}
                options={[
                  {
                    label: t('changeOpacity.options.insideOut'),
                    value: 'inside-out'
                  },
                  {
                    label: t('changeOpacity.options.outsideIn'),
                    value: 'outside-in'
                  }
                ]}
                onChange={(value) => updateField('gradientDirection', value)}
                description={t('changeOpacity.options.gradientDirection')}
              />
            </Box>
          )}
        </Box>
      )
    },
    ...(values.mode === 'gradient'
      ? [
          {
            title: t('changeOpacity.options.opacityArea'),
            component: (
              <Box>
                <TextFieldWithDesc
                  description={t('changeOpacity.options.leftPosition')}
                  value={values.areaLeft}
                  onOwnChange={(val) =>
                    updateNumberField(val, 'areaLeft', updateField)
                  }
                  inputProps={{
                    min: 0,
                    max: getMaxAreaPosition(imageSize.width, values.areaWidth)
                  }}
                  type="number"
                />

                <TextFieldWithDesc
                  description={t('changeOpacity.options.topPosition')}
                  value={values.areaTop}
                  onOwnChange={(val) =>
                    updateNumberField(val, 'areaTop', updateField)
                  }
                  inputProps={{
                    min: 0,
                    max: getMaxAreaPosition(imageSize.height, values.areaHeight)
                  }}
                  type="number"
                />

                <TextFieldWithDesc
                  description={t('changeOpacity.options.width')}
                  value={values.areaWidth}
                  onOwnChange={(val) =>
                    updateNumberField(val, 'areaWidth', updateField)
                  }
                  inputProps={{
                    min: 1,
                    max: imageSize.width || undefined
                  }}
                  type="number"
                />

                <TextFieldWithDesc
                  description={t('changeOpacity.options.height')}
                  value={values.areaHeight}
                  onOwnChange={(val) =>
                    updateNumberField(val, 'areaHeight', updateField)
                  }
                  inputProps={{
                    min: 1,
                    max: imageSize.height || undefined
                  }}
                  type="number"
                />
              </Box>
            )
          }
        ]
      : []),
    {
      title: t('changeOpacity.options.backgroundOptions'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('backgroundMode', 'transparent')}
            checked={values.backgroundMode === 'transparent'}
            description={t('changeOpacity.options.transparentAlphaDescription')}
            title={t('changeOpacity.options.transparentAlpha')}
          />
          <SimpleRadio
            onClick={() => updateField('backgroundMode', 'color')}
            checked={values.backgroundMode === 'color'}
            description={t('changeOpacity.options.solidColorDescription')}
            title={t('changeOpacity.options.solidColor')}
          />
          {values.backgroundMode === 'color' && (
            <Box mt={2}>
              <ColorSelector
                value={values.backgroundColor}
                onColorChange={(val) => updateField('backgroundColor', val)}
                description={t('changeOpacity.options.chooseBackgroundColor')}
                inputProps={{ 'data-testid': 'background-color-input' }}
              />
            </Box>
          )}
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      key={`${imageSize.width}x${imageSize.height}`}
      title={title}
      input={input}
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/*']}
          title={t('changeOpacity.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult title={t('changeOpacity.resultTitle')} value={result} />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={debouncedCompute}
    />
  );
}
