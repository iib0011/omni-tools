export interface GenericCalcType {
  title: string;
  name: string;
  formula: string;

  extraOutputs?: {
    title: string;
    formula: string;
    unit: string;
    // Si prefix default
    defaultPrefix?: string;
  }[];
  selections?: {
    title: string;
    source: string;
    default: string;
    bind: {
      [key: string]: string;
    };
  }[];
  variables: {
    name: string;
    title: string;
    unit: string;
    defaultPrefix?: string;
    // If absence, assume it's the default target var
    default?: number;
  }[];
}
