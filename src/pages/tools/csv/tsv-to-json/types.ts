export type InitialValuesType = {
  delimiter: string;
  quote: string;
  comment: string;
  useHeaders: boolean;
  skipEmptyLines: boolean;
  dynamicTypes: boolean;
  indentationType: 'tab' | 'space' | 'none';
  spacesCount: number;
};
