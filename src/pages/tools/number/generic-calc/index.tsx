import {
  Box,
  InputLabel,
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
import { GetGroupsType, UpdateField } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';

import nerdamer from 'nerdamer';
import 'nerdamer/Algebra';
import 'nerdamer/Solve';
import 'nerdamer/Calculus';

const ohmsLawCalc: {
  name: string;
  formula: string;
  variables: {
    name: string;
    title: string;
    unit: string;
  }[];
} = {
  name: "Ohm's Law Calculator",
  formula: 'V = I * R',
  variables: [
    {
      name: 'V',
      title: 'Voltage',
      unit: 'V'
    },
    {
      name: 'I',
      title: 'Current',
      unit: 'A'
    },
    {
      name: 'R',
      title: 'Resistance',
      unit: 'Ω'
    }
  ]
};

export default function makeTool(): React.JSXElementConstructor<ToolComponentProps> {
  const initialValues: InitialValuesType = {
    outputVariable: '',
    vars: {}
  };

  return function GenericCalc({ title }: ToolComponentProps) {
    const [result, setResult] = useState<string>('');
    const [shortResult, setShortResult] = useState<string>('');

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

    return (
      <ToolContent
        title={title}
        inputComponent={null}
        resultComponent={
          <ToolTextResult title={ohmsLawCalc.name} value={result} />
        }
        initialValues={initialValues}
        toolInfo={{
          title: 'Common Equations',
          description:
            'Common mathematical equations that can be used in calculations.'
        }}
        getGroups={({ values, updateField }) => [
          {
            title: 'Input Variables',
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
                  {ohmsLawCalc.variables.map((variable) => (
                    <TableRow key={variable.name}>
                      <TableCell>{variable.name}</TableCell>
                      <TableCell>
                        <TextFieldWithDesc
                          title={variable.title}
                          sx={{ width: '25ch' }}
                          description=""
                          value={
                            values.outputVariable === variable.name
                              ? shortResult
                              : values.vars[variable.name]?.value || NaN
                          }
                          disabled={values.outputVariable === variable.name}
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
          let expr = nerdamer(ohmsLawCalc.formula);

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
        }}
      />
    );
  };
}
