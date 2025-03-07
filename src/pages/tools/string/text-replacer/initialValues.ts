export type InitialValuesType = {
  textToReplace: string;
  searchValue: string;
  searchRegexp: string;
  replaceValue: string;
  mode: 'text' | 'regexp';
};

export const initialValues: InitialValuesType = {
  textToReplace: '',
  searchValue: '',
  searchRegexp: '',
  replaceValue: '',
  mode: 'text'
};
