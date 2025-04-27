export type InitialValuesType = {
  vars: {
    [key: string]: {
      value: number;
      unit: string;
    };
  };

  // Track preset selections
  presets: {
    [key: string]: string;
  };
  outputVariable: string;
};
