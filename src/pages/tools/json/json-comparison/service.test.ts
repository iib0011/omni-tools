import { compareJson } from './service';

describe('compareJson', () => {
  it('should identify missing properties', () => {
    const json1 = '{"name": "John", "age": 30}';
    const json2 = '{"name": "John"}';

    expect(compareJson(json1, json2, 'text')).toContain(
      'age: Missing in second JSON'
    );
  });

  it('should identify value mismatches', () => {
    const json1 = '{"name": "John", "age": 30}';
    const json2 = '{"name": "John", "age": 25}';

    expect(compareJson(json1, json2, 'text')).toContain(
      'age: Mismatch: 30 != 25'
    );
  });

  it('should handle nested objects', () => {
    const json1 = '{"person": {"name": "John", "age": 30}}';
    const json2 = '{"person": {"name": "Jane", "age": 30}}';

    expect(compareJson(json1, json2, 'text')).toContain(
      'person.name: Mismatch: John != Jane'
    );
  });

  it('should return JSON format when specified', () => {
    const json1 = '{"name": "John", "age": 30}';
    const json2 = '{"name": "Jane", "age": 25}';

    const result = compareJson(json1, json2, 'json');
    const parsed = JSON.parse(result);

    expect(parsed).toHaveProperty('name');
    expect(parsed).toHaveProperty('age');
  });

  it('should handle arrays', () => {
    const json1 = '{"numbers": [1, 2, 3]}';
    const json2 = '{"numbers": [1, 2, 4]}';

    expect(compareJson(json1, json2, 'text')).toContain(
      'numbers.2: Mismatch: 3 != 4'
    );
  });

  it('should return "No differences found" for identical JSONs', () => {
    const json1 = '{"name": "John", "age": 30}';
    const json2 = '{"name": "John", "age": 30}';

    expect(compareJson(json1, json2, 'text')).toBe('No differences found');
  });

  it('should throw error for invalid JSON', () => {
    const json1 = '{"name": "John"';
    const json2 = '{"name": "John"}';

    expect(() => compareJson(json1, json2, 'text')).toThrow();
  });
});
