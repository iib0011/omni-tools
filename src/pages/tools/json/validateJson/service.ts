import { parseJsonInput } from '@utils/json';

export const validateJson = (
  input: string
): { valid: boolean; error?: string } => {
  try {
    parseJsonInput(input);
    return { valid: true };
  } catch (error) {
    if (error instanceof Error) {
      return { valid: false, error: error.message };
    }
    return { valid: false, error: 'Unknown error occurred' };
  }
};
