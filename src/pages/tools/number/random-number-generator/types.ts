export type InitialValuesType = {
  minValue: number;
  maxValue: number;
  count: number;
  allowDecimals: boolean;
  allowDuplicates: boolean;
  sortResults: boolean;
  separator: string;
};

export type RandomNumberResult = {
  numbers: number[];
  min: number;
  max: number;
  count: number;
  hasDuplicates: boolean;
  isSorted: boolean;
};
