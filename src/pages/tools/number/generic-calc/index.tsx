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
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { UpdateField } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import type { GenericCalcType } from './data/types';
import type { DataTable } from 'datatables';
import { getDataTable, dataTableLookup } from 'datatables';

import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Solve';
import 'nerdamer/Calculus';

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
    const [shortResult, setShortResult] = useState<string>('');

    // For UX purposes we need to track what vars are
    const [valsBoundToPreset, setValsBoundToPreset] = useState<{
      [key: string]: string;
    }>({});

    const [extraOutputs, setExtraOutputs] = useState<{
      [key: string]: string;
    }>({});

    const updateVarField = (
      name: string,
      value: number,
      values: InitialValuesType,
      updateFieldFunc: UpdateField<InitialValuesType>
    ) => {
      // Make copy
      const newVars = { ...values.vars };
      newVars[name] = {
        value,
        unit: values.vars[name]?.unit || ''
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

    return (
      <ToolContent
        title={title}
        inputComponent={null}
        resultComponent={
          <ToolTextResult title={calcData.title} value={result} />
        }
        initialValues={initialValues}
        toolInfo={{
          title: 'Common Equations',
          description:
            'Common mathematical equations that can be used in calculations.'
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
                    <TableCell>Variable</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Solve For</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calcData.variables.map((variable) => (
                    <TableRow key={variable.name}>
                      <TableCell>{variable.title}</TableCell>
                      <TableCell>
                        <TextFieldWithDesc
                          title={variable.title}
                          sx={{ width: '25ch' }}
                          description={valsBoundToPreset[variable.name] || ''}
                          value={
                            values.outputVariable === variable.name
                              ? shortResult
                              : values.vars[variable.name]?.value || NaN
                          }
                          disabled={
                            values.outputVariable === variable.name ||
                            valsBoundToPreset[variable.name] !== undefined
                          }
                          onOwnChange={(val) =>
                            updateVarField(
                              variable.name,
                              parseFloat(val),
                              values,
                              updateField
                            )
                          }
                          type="number"
                        />
                      </TableCell>
                      <TableCell>{variable.unit}</TableCell>

                      <TableCell>
                        <Radio
                          value={variable.name}
                          checked={values.outputVariable === variable.name}
                          disabled={
                            valsBoundToPreset[variable.name] !== undefined
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
                      <TableCell>{extraOutput.title}</TableCell>
                      <TableCell>{extraOutputs[extraOutput.title]}</TableCell>
                      <TableCell>{extraOutput.unit}</TableCell>
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

          let result: nerdamer.Expression = expr.solveFor(
            values.outputVariable
          );

          // Sometimes the result is an array
          if (result.toDecimal === undefined) {
            result = (result as unknown as nerdamer.Expression[])[0];
          }

          setResult(result.toString());

          if (result) {
            if (values.vars[values.outputVariable] != undefined) {
              values.vars[values.outputVariable].value = parseFloat(
                result.toDecimal()
              );
            }
            setShortResult(result.toDecimal());
          } else {
            setShortResult('');
          }

          if (calcData.extraOutputs !== undefined) {
            for (let i = 0; i < calcData.extraOutputs.length; i++) {
              const extraOutput = calcData.extraOutputs[i];

              let expr = nerdamer(extraOutput.formula);

              Object.keys(values.vars).forEach((key) => {
                if (key === values.outputVariable) return;
                expr = expr.sub(key, values.vars[key].value.toString());
              });

              const result: nerdamer.Expression = expr.evaluate();

              if (result) {
                extraOutputs[extraOutput.title] = result.toDecimal();
              }
            }
          }
        }}
      />
    );
  };
}
