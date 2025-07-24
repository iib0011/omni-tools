export type InitialValuesType = {
  expiration: '1hour' | '1day' | '1week' | '1month' | 'never';
  burnAfterReading: boolean;
  password: string;
};

export interface PasteData {
  id: string;
  content: string;
  expiration: string;
  burnAfterReading: boolean;
  password?: string;
  createdAt: number;
}
