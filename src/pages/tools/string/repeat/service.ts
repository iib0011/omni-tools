import { InitialValuesType } from './initialValues';

export function repeatText(options: InitialValuesType, text: string) {
  const { repeatAmount, delimiter } = options;

  const parsedAmount = parseInt(repeatAmount) || 0;

  return Array(parsedAmount).fill(text).join(delimiter);
}
