type SIUnit = 'b' | 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB';
type IECUnit = 'b' | 'B' | 'KiB' | 'MiB' | 'GiB' | 'TiB' | 'PiB' | 'EiB';

export type DataUnit = SIUnit | IECUnit;

const SI_UNITS: SIUnit[] = ['b', 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
const IEC_UNITS: IECUnit[] = [
  'b',
  'B',
  'KiB',
  'MiB',
  'GiB',
  'TiB',
  'PiB',
  'EiB'
];

export const DATA_UNITS: DataUnit[] = [
  ...SI_UNITS,
  ...IEC_UNITS.filter((unit) => !SI_UNITS.includes(unit as SIUnit))
];

export const UNIT_MAP: Record<DataUnit, number> = {
  b: 1 / 8,
  B: 1,
  KB: 1e3,
  MB: 1e6,
  GB: 1e9,
  TB: 1e12,
  PB: 1e15,
  EB: 1e18,
  KiB: 1024,
  MiB: 1024 ** 2,
  GiB: 1024 ** 3,
  TiB: 1024 ** 4,
  PiB: 1024 ** 5,
  EiB: 1024 ** 6
};

export type InitialValuesType = {
  fromUnit: DataUnit;
  toUnit: DataUnit;
  precision: number;
};
