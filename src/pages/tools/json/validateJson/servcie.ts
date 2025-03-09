export const validateJson = (
  input: string
): { valid: boolean; error?: string } => {
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (error) {
    if (error instanceof SyntaxError) {
      const message = error.message;
      return { valid: false, error: error.message };
    }
    return { valid: false, error: 'Unknown error occurred' };
  }
};
