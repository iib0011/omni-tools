export type InitialValuesType = {
  vars: {
    [key: string]: {
      value: number;
      unit: string;
    };
  };

  outputVariable: string;
};
