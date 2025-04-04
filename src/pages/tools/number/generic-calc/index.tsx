import {
  Box,
  Autocomplete,
  TextField,
  Radio,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextResult from '@components/result/ToolTextResult';
import NumericInputWithUnit from '@components/input/NumericInputWithUnit';
import { UpdateField } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import type { AlternativeVarInfo, GenericCalcType } from './data/types';
import type { DataTable } from 'datatables';
import { getDataTable, dataTableLookup } from 'datatables';

import nerdamer from 'nerdamer-prime';
import 'nerdamer-prime/Algebra';
import 'nerdamer-prime/Solve';
import 'nerdamer-prime/Calculus';
import Qty from 'js-quantities';

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

  const dataTables: { [key: string]: DataTable } = {};

  for (const selection of calcData.selections || []) {
    dataTables[selection.source] = await getDataTable(selection.source);
  }

  return function GenericCalc({ title }: ToolComponentProps) {
    const [result, setResult] = useState<string>('');

    const [alternatesByVariable, setAlternatesByVariable] = useState<{
      [key: string]: {
        value: {
          value: number;
          unit: string;
        };
      }[];
    }>({});

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

      // Clear old selection
      for (const key in valsBoundToPreset) {
        if (valsBoundToPreset[key] === selection) {
          delete valsBoundToPreset[key];
        }
      }

      const selectionData = calcData.selections?.find(
        (sel) => sel.title === selection
      );

      if (preset && preset != '<custom>') {
        if (selectionData) {
          for (const key in selectionData.bind) {
            valsBoundToPreset[key] = selection;

            if (currentValues.outputVariable === key) {
              handleSelectedTargetChange('', updateFieldFunc);
            }

            updateVarField(
              key,

              dataTableLookup(dataTables[selectionData.source], preset)[
                selectionData.bind[key]
              ],

              dataTables[selectionData.source].columns[selectionData.bind[key]]
                ?.unit || '',
              currentValues,
              updateFieldFunc
            );
          }
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

    calcData.selections?.forEach((selection) => {
      initialValues.presets[selection.title] = selection.default;
      if (selection.default == '<custom>') return;
      for (const key in selection.bind) {
        initialValues.vars[key] = {
          value: dataTableLookup(
            dataTables[selection.source],
            selection.default
          )[selection.bind[key]],

          unit:
            dataTables[selection.source].columns[selection.bind[key]]?.unit ||
            ''
        };
        valsBoundToPreset[key] = selection.title;
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

    calcData.variables.forEach((variable) => {
      if (variable.alternates) {
        variable.alternates.forEach((alt) => {
          const altValue = getAlternate(
            alt,
            variable,
            initialValues.vars[variable.name]
          );
          if (alternatesByVariable[variable.name] === undefined) {
            alternatesByVariable[variable.name] = [];
          }

          alternatesByVariable[variable.name].push({
            value: { value: altValue, unit: variable.unit }
          });
        });
      }
    });

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
        getGroups={({ values, updateField }) => [
          {
            title: 'Presets',
            component: (
              <Box>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Option</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {calcData.selections?.map((preset) => (
                      <TableRow key={preset.title}>
                        <TableCell>{preset.title}</TableCell>
                        <TableCell>
                          <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            value={values.presets[preset.title]}
                            options={[
                              '<custom>',
                              ...Object.keys(
                                dataTables[preset.source].data
                              ).sort()
                            ]}
                            sx={{ width: 300 }}
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
                          ></Autocomplete>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )
          },
          {
            title: 'Variables',
            component: (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Value</TableCell>
                    <TableCell>Solve For</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calcData.variables.map((variable) => (
                    <TableRow key={variable.name}>
                      <TableCell>
                        <Table>
                          <TableRow>
                            <TableCell>{variable.title}</TableCell>
                            <TableCell>
                              <NumericInputWithUnit
                                description={
                                  valsBoundToPreset[variable.name] || ''
                                }
                                defaultPrefix={variable.defaultPrefix}
                                value={values.vars[variable.name]}
                                disabled={
                                  values.outputVariable === variable.name ||
                                  valsBoundToPreset[variable.name] !== undefined
                                }
                                disableChangingUnit={
                                  valsBoundToPreset[variable.name] !== undefined
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
                                type="number"
                              />
                            </TableCell>
                          </TableRow>

                          {variable.alternates?.map((alt) => (
                            <TableRow key={alt.title}>
                              <TableCell>{alt.title}</TableCell>
                              <TableCell>
                                <NumericInputWithUnit
                                  key={alt.title}
                                  description={
                                    valsBoundToPreset[alt.title] || ''
                                  }
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
                                      getMainFromAlternate(alt, variable, val),
                                      variable.unit,
                                      values,
                                      updateField
                                    )
                                  }
                                ></NumericInputWithUnit>
                              </TableCell>
                            </TableRow>
                          ))}
                        </Table>
                      </TableCell>

                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))}

                  {calcData.extraOutputs?.map((extraOutput) => (
                    <TableRow key={extraOutput.title}>
                      <TableCell>
                        {extraOutput.title}
                        <NumericInputWithUnit
                          disabled={true}
                          defaultPrefix={extraOutput.defaultPrefix}
                          value={{
                            value: extraOutputs[extraOutput.title],
                            unit: extraOutput.unit
                          }}
                        ></NumericInputWithUnit>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          }
        ]}
        compute={(values) => {
          if (values.outputVariable === '') {
            setResult('Please select a solve for variable');
            return;
          }
          let expr = nerdamer(calcData.formula);

          Object.keys(values.vars).forEach((key) => {
            if (key === values.outputVariable) return;
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
                for (let i = 0; i < calcData.extraOutputs.length; i++) {
                  const extraOutput = calcData.extraOutputs[i];
                  extraOutputs[extraOutput.title] = NaN;
                }
              }
              throw new Error('No solution found for this input');
            }
            result = (result as unknown as nerdamer.Expression[])[0];
          }

          setResult(result.toString());

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
                if (key === values.outputVariable) return;
                expr = expr.sub(key, values.vars[key].value.toString());
              });

              // todo could this have multiple solutions too?
              const result: nerdamer.Expression = expr.evaluate();

              if (result) {
                extraOutputs[extraOutput.title] = parseFloat(
                  result.toDecimal()
                );
              }
            }
          }
        }}
      />
    );
  };
}
