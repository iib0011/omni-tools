export type mode = 'date-to-unix' | 'unix-to-date';

export default interface InitialValuesType {
  mode: mode;
  withLabel: boolean;
  useLocalTime: boolean;
}
