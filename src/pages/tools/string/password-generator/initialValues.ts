export type InitialValuesType = {
  length: string; // user enters a number here
  includeLowercase: boolean;
  includeUppercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  avoidAmbiguous: boolean;
};

export const initialValues: InitialValuesType = {
  length: '12',
  includeLowercase: true,
  includeUppercase: true,
  includeNumbers: true,
  includeSymbols: true,
  avoidAmbiguous: false
};
