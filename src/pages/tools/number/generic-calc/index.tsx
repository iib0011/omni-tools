import { Autocomplete, Box, Radio, Stack, TextField } from '@mui/material';
import React, { useContext, useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import NumericInputWithUnit from '@components/input/NumericInputWithUnit';
import { UpdateField } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import type { AlternativeVarInfo, GenericCalcType } from './data/types';
import { dataTableLookup } from 'datatables';

import nerdamer from 'nerdamer-prime';
import 'nerdamer-prime/Algebra';
import 'nerdamer-prime/Solve';
import 'nerdamer-prime/Calculus';
import Qty from 'js-quantities';
import { CustomSnackBarContext } from 'contexts/CustomSnackBarContext';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

function numericSolveEquationFor(
  equation: string,
  varName: string,
  variables: { [key: string]: number }
) {
  let expr = nerdamer(equation);
  for (const key in variables) {
    expr = expr.sub(key, variables[key].toString());
  }

  let result: nerdamer.Expression | nerdamer.Expression[] =
    expr.solveFor(varName);

  // Sometimes the result is an array, check for it while keeping linter happy
  if ((result as unknown as nerdamer.Expression).toDecimal === undefined) {
    result = (result as unknown as nerdamer.Expression[])[0];
  }

  return parseFloat(
    (result as unknown as nerdamer.Expression).evaluate().toDecimal()
  );
}

export default async function makeTool(
  calcData: GenericCalcType
): Promise<React.JSXElementConstructor<ToolComponentProps>> {
  const initialValues: InitialValuesType = {
    outputVariable: '',
    vars: {},
    presets: {}
  };

  return function GenericCalc({ title }: ToolComponentProps) {
    const { showSnackBar } = useContext(CustomSnackBarContext);

    // For UX purposes we need to track what vars are
    const [valsBoundToPreset, setValsBoundToPreset] = useState<{
      [key: string]: string;
    }>({});

    const [extraOutputs, setExtraOutputs] = useState<{
      [key: string]: number;
    }>({});

    const updateVarField = (
      name: string,
      value: number,
      unit: string,
      values: InitialValuesType,
      updateFieldFunc: UpdateField<InitialValuesType>
    ) => {
      // Make copy
      const newVars = { ...values.vars };
      newVars[name] = {
        value,
        unit: unit
      };
      updateFieldFunc('vars', newVars);
    };

    const handleSelectedTargetChange = (
      varName: string,
      updateFieldFunc: UpdateField<InitialValuesType>
    ) => {
      updateFieldFunc('outputVariable', varName);
    };

    const handleSelectedPresetChange = (
      selection: string,
      preset: string,
      currentValues: InitialValuesType,
      updateFieldFunc: UpdateField<InitialValuesType>
    ) => {
      const newPresets = { ...currentValues.presets };
      newPresets[selection] = preset;
      updateFieldFunc('presets', newPresets);

      // Clear old selection using setState callback pattern
      setValsBoundToPreset((prevState) => {
        const newState = { ...prevState };
        // Remove all keys bound to this selection
        Object.keys(newState).forEach((key) => {
          if (newState[key] === selection) {
            delete newState[key];
          }
        });
        return newState;
      });

      const selectionData = calcData.presets?.find(
        (sel) => sel.title === selection
      );

      if (preset && preset != '<custom>') {
        if (selectionData) {
          // Create an object with the new bindings
          const newBindings: { [key: string]: string } = {};

          for (const key in selectionData.bind) {
            // Add to newBindings for later state update
            newBindings[key] = selection;

            if (currentValues.outputVariable === key) {
              handleSelectedTargetChange('', updateFieldFunc);
            }

            updateVarField(
              key,

              dataTableLookup(selectionData.source, preset)[
                selectionData.bind[key]
              ],

              selectionData.source.columns[selectionData.bind[key]]?.unit || '',
              currentValues,
              updateFieldFunc
            );
          }

          // Update state with new bindings
          setValsBoundToPreset((prevState) => ({
            ...prevState,
            ...newBindings
          }));
        } else {
          throw new Error(
            `Preset "${preset}" is not valid for selection "${selection}"`
          );
        }
      }
    };

    calcData.variables.forEach((variable) => {
      if (variable.solvable === undefined) {
        variable.solvable = true;
      }
      if (variable.default === undefined) {
        initialValues.vars[variable.name] = {
          value: NaN,
          unit: variable.unit
        };
        initialValues.outputVariable = variable.name;
      } else {
        initialValues.vars[variable.name] = {
          value: variable.default || 0,
          unit: variable.unit
        };
      }
    });

    calcData.presets?.forEach((selection) => {
      initialValues.presets[selection.title] = selection.default;
      if (selection.default == '<custom>') return;
      for (const key in selection.bind) {
        initialValues.vars[key] = {
          value: dataTableLookup(selection.source, selection.default)[
            selection.bind[key]
          ],

          unit: selection.source.columns[selection.bind[key]]?.unit || ''
        };
        // We'll set this in useEffect instead of directly modifying state
      }
    });

    function getAlternate(
      alternateInfo: AlternativeVarInfo,
      mainInfo: GenericCalcType['variables'][number],
      mainValue: {
        value: number;
        unit: string;
      }
    ) {
      if (isNaN(mainValue.value)) return NaN;
      const canonicalValue = Qty(mainValue.value, mainValue.unit).to(
        mainInfo.unit
      ).scalar;

      return numericSolveEquationFor(alternateInfo.formula, 'x', {
        v: canonicalValue
      });
    }

    function getMainFromAlternate(
      alternateInfo: AlternativeVarInfo,
      mainInfo: GenericCalcType['variables'][number],
      alternateValue: {
        value: number;
        unit: string;
      }
    ) {
      if (isNaN(alternateValue.value)) return NaN;
      const canonicalValue = Qty(alternateValue.value, alternateValue.unit).to(
        alternateInfo.unit
      ).scalar;

      return numericSolveEquationFor(alternateInfo.formula, 'v', {
        x: canonicalValue
      });
    }

    return (
      <ToolContent
        title={title}
        inputComponent={null}
        initialValues={initialValues}
        toolInfo={{
          title: calcData.title,
          description:
            (calcData.description || '') +
            ' Generated from formula: ' +
            calcData.formula
        }}
        verticalGroups
        getGroups={({ values, updateField }) => [
          ...(calcData.presets?.length
            ? [
                {
                  title: 'Presets',
                  component: (
                    <Grid container spacing={2} maxWidth={500}>
                      {calcData.presets?.map((preset) => (
                        <Grid item xs={12} key={preset.title}>
                          <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={2}
                            alignItems={'center'}
                            justifyContent={'space-between'}
                          >
                            <Typography>{preset.title}</Typography>
                            <Autocomplete
                              disablePortal
                              id="combo-box-demo"
                              value={values.presets[preset.title]}
                              options={[
                                '<custom>',
                                ...Object.keys(preset.source.data).sort()
                              ]}
                              sx={{ width: '80%' }}
                              onChange={(event, newValue) => {
                                handleSelectedPresetChange(
                                  preset.title,
                                  newValue || '',
                                  values,
                                  updateField
                                );
                              }}
                              renderInput={(params) => (
                                <TextField {...params} label="Preset" />
                              )}
                            />
                          </Stack>
                        </Grid>
                      ))}
                    </Grid>
                  )
                }
              ]
            : []),
          {
            title: 'Variables',
            component: (
              <Box>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={10}></Grid>
                  <Grid item xs={2}>
                    <Typography fontWeight="bold" align="center">
                      Solve For
                    </Typography>
                  </Grid>
                </Grid>

                {calcData.variables.map((variable) => (
                  <Box
                    key={variable.name}
                    sx={{
                      mb: 3,
                      p: 1,
                      borderRadius: 1
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={10}>
                        <Box>
                          <Stack spacing={2}>
                            <Box>
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Typography sx={{ minWidth: '8%' }}>
                                  {variable.title}
                                </Typography>
                                <NumericInputWithUnit
                                  defaultPrefix={variable.defaultPrefix}
                                  value={values.vars[variable.name]}
                                  disabled={
                                    values.outputVariable === variable.name ||
                                    valsBoundToPreset[variable.name] !==
                                      undefined
                                  }
                                  disableChangingUnit={
                                    valsBoundToPreset[variable.name] !==
                                    undefined
                                  }
                                  onOwnChange={(val) =>
                                    updateVarField(
                                      variable.name,
                                      val.value,
                                      val.unit,
                                      values,
                                      updateField
                                    )
                                  }
                                />
                              </Stack>
                            </Box>

                            {variable.alternates?.map((alt) => (
                              <Box key={alt.title}>
                                <Stack
                                  direction="row"
                                  spacing={2}
                                  alignItems="center"
                                >
                                  <Typography sx={{ minWidth: '8%' }}>
                                    {alt.title}
                                  </Typography>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <NumericInputWithUnit
                                      key={alt.title}
                                      defaultPrefix={alt.defaultPrefix || ''}
                                      value={{
                                        value:
                                          getAlternate(
                                            alt,
                                            variable,
                                            values.vars[variable.name]
                                          ) || NaN,
                                        unit: alt.unit || ''
                                      }}
                                      disabled={
                                        values.outputVariable ===
                                          variable.name ||
                                        valsBoundToPreset[variable.name] !==
                                          undefined
                                      }
                                      disableChangingUnit={
                                        valsBoundToPreset[variable.name] !==
                                        undefined
                                      }
                                      onOwnChange={(val) =>
                                        updateVarField(
                                          variable.name,
                                          getMainFromAlternate(
                                            alt,
                                            variable,
                                            val
                                          ),
                                          variable.unit,
                                          values,
                                          updateField
                                        )
                                      }
                                    />
                                  </Box>
                                </Stack>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </Grid>

                      <Grid
                        item
                        xs={2}
                        sx={{ display: 'flex', justifyContent: 'center' }}
                      >
                        <Radio
                          value={variable.name}
                          checked={values.outputVariable === variable.name}
                          disabled={
                            valsBoundToPreset[variable.name] !== undefined ||
                            variable.solvable === false
                          }
                          onClick={() =>
                            handleSelectedTargetChange(
                              variable.name,
                              updateField
                            )
                          }
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            )
          },
          ...(calcData.extraOutputs
            ? [
                {
                  title: 'Extra outputs',
                  component: (
                    <Grid container spacing={2}>
                      {calcData.extraOutputs?.map((extraOutput) => (
                        <Grid item xs={12} key={extraOutput.title}>
                          <Stack spacing={1} px={4}>
                            <Typography>{extraOutput.title}</Typography>
                            <NumericInputWithUnit
                              disabled={true}
                              defaultPrefix={extraOutput.defaultPrefix}
                              value={{
                                value: extraOutputs[extraOutput.title],
                                unit: extraOutput.unit
                              }}
                            />
                          </Stack>
                        </Grid>
                      ))}
                    </Grid>
                  )
                }
              ]
            : [])
        ]}
        compute={(values) => {
          if (values.outputVariable === '') {
            showSnackBar('Please select a solve for variable', 'error');
            return;
          }
          let expr: nerdamer.Expression | null = null;

          for (const variable of calcData.variables) {
            if (variable.name === values.outputVariable) {
              if (variable.formula !== undefined) {
                expr = nerdamer(variable.formula);
              }
            }
          }

          if (expr == null) {
            expr = nerdamer(calcData.formula);
          }
          if (expr == null) {
            throw new Error('No formula found');
          }

          Object.keys(values.vars).forEach((key) => {
            if (key === values.outputVariable) return;
            if (expr === null) {
              throw new Error('Math fail');
            }
            expr = expr.sub(key, values.vars[key].value.toString());
          });

          let result: nerdamer.Expression | nerdamer.Expression[] =
            expr.solveFor(values.outputVariable);

          // Sometimes the result is an array
          if (
            (result as unknown as nerdamer.Expression).toDecimal === undefined
          ) {
            if ((result as unknown as nerdamer.Expression[])?.length < 1) {
              values.vars[values.outputVariable].value = NaN;
              if (calcData.extraOutputs !== undefined) {
                // Update extraOutputs using setState
                setExtraOutputs((prevState) => {
                  const newState = { ...prevState };
                  for (let i = 0; i < calcData.extraOutputs!.length; i++) {
                    const extraOutput = calcData.extraOutputs![i];
                    newState[extraOutput.title] = NaN;
                  }
                  return newState;
                });
              }
              throw new Error('No solution found for this input');
            }
            result = (result as unknown as nerdamer.Expression[])[0];
          }

          if (result) {
            if (values.vars[values.outputVariable] != undefined) {
              values.vars[values.outputVariable].value = parseFloat(
                (result as unknown as nerdamer.Expression)
                  .evaluate()
                  .toDecimal()
              );
            }
          } else {
            values.vars[values.outputVariable].value = NaN;
          }

          if (calcData.extraOutputs !== undefined) {
            for (let i = 0; i < calcData.extraOutputs.length; i++) {
              const extraOutput = calcData.extraOutputs[i];

              let expr = nerdamer(extraOutput.formula);

              Object.keys(values.vars).forEach((key) => {
                expr = expr.sub(key, values.vars[key].value.toString());
              });

              // todo could this have multiple solutions too?
              const result: nerdamer.Expression = expr.evaluate();

              if (result) {
                // Update extraOutputs state properly
                setExtraOutputs((prevState) => ({
                  ...prevState,
                  [extraOutput.title]: parseFloat(result.toDecimal())
                }));
              }
            }
          }
        }}
      />
    );
  };
}
