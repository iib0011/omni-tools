export type UnitCategory =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'speed'
  | 'area'
  | 'volume';

export interface Unit {
  label: string;
  symbol: string;
  toBase?: number;
}

export interface ConversionResult {
  unit: Unit;
  value: number;
  formula: string;
}

export interface InitialValuesType {
  category: UnitCategory;
  fromUnit: string;
  precision: number;
}
