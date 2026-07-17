import { describe, it, expect } from 'vitest';
import { sortJson } from './service';
import { InitialValuesType } from './types';

const ascByKey: InitialValuesType = { mode: 'key', order: 'asc', key: 'name' };
const descByKey: InitialValuesType = {
  mode: 'key',
  order: 'desc',
  key: 'name'
};

describe('sortJson', () => {
  it('should sort object keys ascending', () => {
    const result = sortJson('{"c": 3, "a": 1, "b": 2}', ascByKey);
    const parsed = JSON.parse(result);
    expect(Object.keys(parsed)).toEqual(['a', 'b', 'c']);
  });

  it('should sort object keys descending', () => {
    const result = sortJson('{"a": 1, "b": 2, "c": 3}', descByKey);
    const parsed = JSON.parse(result);
    expect(Object.keys(parsed)).toEqual(['c', 'b', 'a']);
  });

  it('should throw on invalid JSON', () => {
    expect(() => sortJson('invalid', ascByKey)).toThrow('Invalid JSON string');
  });

  it('should sort array of objects by key ascending', () => {
    const input = '[{"name": "z"}, {"name": "a"}, {"name": "m"}]';
    const result = sortJson(input, {
      mode: 'value',
      order: 'asc',
      key: 'name'
    });
    const parsed = JSON.parse(result);
    expect(parsed[0].name).toBe('a');
    expect(parsed[1].name).toBe('m');
    expect(parsed[2].name).toBe('z');
  });

  it('should sort array of objects by key descending', () => {
    const input = '[{"name": "a"}, {"name": "z"}, {"name": "m"}]';
    const result = sortJson(input, {
      mode: 'value',
      order: 'desc',
      key: 'name'
    });
    const parsed = JSON.parse(result);
    expect(parsed[0].name).toBe('z');
    expect(parsed[2].name).toBe('a');
  });

  it('should throw on empty array in value mode', () => {
    expect(() =>
      sortJson('[]', { mode: 'value', order: 'asc', key: 'name' })
    ).toThrow('Array is empty');
  });
});
