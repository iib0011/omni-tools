import { parseJsonInput, JsonFormat } from '@utils/json';

export interface MinifyJsonResult {
  result: string;
  format: JsonFormat;
}

export const minifyJson = (text: string): MinifyJsonResult => {
  const { data, format } = parseJsonInput(text);

  if (format === 'jsonl' && Array.isArray(data)) {
    return {
      result: data.map((item) => JSON.stringify(item)).join('\n'),
      format
    };
  }

  return { result: JSON.stringify(data), format };
};
