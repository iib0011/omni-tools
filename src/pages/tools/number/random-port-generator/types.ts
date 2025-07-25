export type InitialValuesType = {
  portRange: 'well-known' | 'registered' | 'dynamic' | 'custom';
  minPort: number;
  maxPort: number;
  count: number;
  allowDuplicates: boolean;
  sortResults: boolean;
  separator: string;
};

export type PortRange = {
  name: string;
  min: number;
  max: number;
  description: string;
};

export type RandomPortResult = {
  ports: number[];
  range: PortRange;
  count: number;
  hasDuplicates: boolean;
  isSorted: boolean;
};
