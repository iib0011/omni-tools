import { parseJsonInput, JsonFormat } from '@utils/json';

export const validateJson = (
  input: string
): { valid: boolean; error?: string; format?: JsonFormat } => {
  try {
    const { format } = parseJsonInput(input);
    return { valid: true, format: format };
  } catch (error) {
    if (error instanceof Error) {
      return { valid: false, error: error.message };
    }
    return { valid: false, error: 'Unknown error occurred' };
  }
};
