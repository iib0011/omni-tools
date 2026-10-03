export type TableFormat =
  | 'markdown'
  | 'csv'
  | 'tsv'
  | 'html'
  | 'mysql'
  | 'json';

export type InitialValuesType = {
  autodetect: boolean;
  inputFormat: TableFormat;
  outputFormat: TableFormat;
};
