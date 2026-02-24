export type DiscordTimestampFormat = 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R';

export type InitialValuesType = {
  format: DiscordTimestampFormat;
  enforceUTC: boolean;
};
