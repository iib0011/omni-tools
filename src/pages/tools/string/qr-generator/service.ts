export const isValidQRCodeInput = (text: string): boolean => {
  return typeof text === 'string' && text.trim().length > 0;
};
