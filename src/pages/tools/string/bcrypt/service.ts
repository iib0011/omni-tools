import { InitialValuesType } from './types';
import bcrypt from 'bcryptjs';

export const bcryptHash = async (
  input: string,
  options: InitialValuesType
): Promise<string> => {
  return bcrypt.hash(input, options.saltRounds);
};
