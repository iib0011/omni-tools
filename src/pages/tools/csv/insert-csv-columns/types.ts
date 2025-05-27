export type insertingPosition = 'prepend' | 'append' | 'custom';
export type customPostion = 'headerName' | 'rowNumber';

export type InitialValuesType = {
  csvToInsert: string;
  separator: string;
  quoteChar: string;
  commentCharacter: string;
  customFill: boolean;
  customFillValue: string;
  insertingPosition: insertingPosition;
  customPostionOptions: customPostion;
  headerName: string;
  rowNumber: number;
};
