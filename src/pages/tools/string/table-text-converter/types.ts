export type TableFormat =
  | 'markdown'
  | 'csv'
  | 'tsv'
  | 'html'
  | 'mysql'
  | 'json';

export type InitialValuesType = {
  inputFormat: TableFormat | 'auto';
  outputFormat: TableFormat;
};
