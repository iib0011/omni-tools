import { InitialValuesType } from './types';
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';

export function prettyPrintXml(
  input: string,
  _options: InitialValuesType
): string {
  const valid = XMLValidator.validate(input);
  if (valid !== true) {
    if (typeof valid === 'object' && valid.err) {
      return `Invalid XML: ${valid.err.msg} (line ${valid.err.line}, col ${valid.err.col})`;
    }
    return 'Invalid XML';
  }
  try {
    const parser = new XMLParser();
    const obj = parser.parse(input);
    const builder = new XMLBuilder({ format: true, indentBy: '  ' });
    return builder.build(obj);
  } catch (e: any) {
    return `Invalid XML: ${e.message}`;
  }
}
