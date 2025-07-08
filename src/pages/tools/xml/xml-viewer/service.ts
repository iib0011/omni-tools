import { InitialValuesType } from './types';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export function prettyPrintXml(
  input: string,
  _options: InitialValuesType
): string {
  try {
    const parser = new XMLParser();
    const obj = parser.parse(input);
    const builder = new XMLBuilder({ format: true, indentBy: '  ' });
    return builder.build(obj);
  } catch (e: any) {
    return `Invalid XML: ${e.message}`;
  }
}
