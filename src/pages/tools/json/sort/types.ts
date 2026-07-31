import { JsonFormat } from '@utils/json';

export type mode = 'value' | 'key';
export type order = 'asc' | 'desc';

export type InitialValuesType = {
  mode: mode;
  key: string;
  order: order;
};

export interface SortJsonResult {
  result: string;
  format: JsonFormat;
}
