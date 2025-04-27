import { tool as numberSum } from './sum/meta';
import { tool as numberGenerate } from './generate/meta';
import { tool as numberArithmeticSequence } from './arithmetic-sequence/meta';
import { tools as genericCalcTools } from './generic-calc/meta';
export const numberTools = [
  numberSum,
  numberGenerate,
  numberArithmeticSequence,
  ...genericCalcTools
];
