import { expect, describe, it } from 'vitest';
import { validateXml } from './service';

describe('xml-validator', () => {
  it('returns Valid XML for well-formed XML', () => {
    const input = '<root><a>1</a><b>2</b></root>';
    const result = validateXml(input, {});
    expect(result).toBe('Valid XML');
  });

  it('returns error for invalid XML', () => {
    const input = '<root><a>1</b></root>';
    const result = validateXml(input, {});
    expect(result).toMatch(/Invalid XML/i);
  });
});
