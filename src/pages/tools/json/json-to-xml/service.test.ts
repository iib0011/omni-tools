import { describe, expect, it } from 'vitest';
import { convertJsonToXml } from './service';

const defaultOptions: Parameters<typeof convertJsonToXml>[1] = {
  indentationType: 'none',
  addMetaTag: false
};

describe('convertJsonToXml', () => {
  it('converts basic objects to XML', () => {
    const result = convertJsonToXml(
      JSON.stringify({ name: 'Alice', active: true }),
      defaultOptions
    );

    expect(result).toBe('<root><name>Alice</name><active>true</active></root>');
  });

  it('normalizes JSON keys into valid XML tag names', () => {
    const result = convertJsonToXml(
      JSON.stringify({
        'hello world': 'value',
        '1st place': 'gold',
        'a<b': 'xss',
        '': 'empty'
      }),
      defaultOptions
    );

    expect(result).toBe(
      '<root><hello_world>value</hello_world><_1st_place>gold</_1st_place><a_b>xss</a_b><_>empty</_></root>'
    );
  });

  it('guards against excessive JSON nesting', () => {
    const input = JSON.stringify(createNestedObject(101));

    expect(() => convertJsonToXml(input, defaultOptions)).toThrow(
      'JSON nesting exceeds maximum depth of 100.'
    );
  });
});

const createNestedObject = (depth: number): object => {
  let current: Record<string, unknown> = { value: 'end' };

  for (let index = 0; index < depth; index += 1) {
    current = { item: current };
  }

  return current;
};
