export interface AlternativeVarInfo {
  title: string;
  unit: string;
  defaultPrefix?: string;
  formula: string;
}
export interface GenericCalcType {
  title: string;
  name: string;
  formula: string;
  description?: string;

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

    // If present and false,  don't allow user to select this as output
    solvable?: boolean;

    // Alternates are alternate ways of entering the exact same thing,
    // like the diameter or radius.  The formula for an alternate
    // can use only one variable, always called v, which is the main
    // variable it's an alternate of
    alternates?: AlternativeVarInfo[];
  }[];
}
