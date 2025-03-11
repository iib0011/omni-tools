export type truncationSideType = 'right' | 'left';

export type InitialValuesType = {
  textToTruncate: string;
  truncationSide: truncationSideType;
  maxLength: string;
  lineByLine: boolean;
  addIndicator: boolean;
  indicator: string;
};

export const initialValues: InitialValuesType = {
  textToTruncate: '',
  truncationSide: 'right',
  maxLength: '15',
  lineByLine: false,
  addIndicator: false,
  indicator: ''
};
