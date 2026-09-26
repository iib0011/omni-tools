export type Weekday =
  | 'sunday'
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday';

export interface FindMatchingYearsInput {
  month: number;
  day: number;
  weekday: Weekday;
  startYear: number;
  endYear: number;
}

export interface MatchingYear {
  year: number;
  date: Date;
  formatted: string;
}

export interface FindMatchingYearsResult {
  matches: MatchingYear[];
  count: number;
}

export type InitialValuesType = {
  month: string;
  day: string;
  weekday: Weekday;
  startYear: string;
  endYear: string;
};
