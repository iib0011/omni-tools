import { encode } from 'morsee';

export const compute = (
  input: string,
  dotSymbol: string,
  dashSymbol: string
): string => {
  return encode(input).replaceAll('.', dotSymbol).replaceAll('-', dashSymbol);
};
