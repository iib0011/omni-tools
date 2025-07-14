import { describe, expect, it } from 'vitest';
import { generatePassword } from './service';
import { initialValues } from './initialValues';

describe('generatePassword', () => {
  it('should generate a password with the specified length', () => {
    const options = { ...initialValues, length: '10' };
    const result = generatePassword(options);
    expect(result).toHaveLength(10);
  });

  it('should return empty string for invalid length', () => {
    const options = { ...initialValues, length: '0' };
    const result = generatePassword(options);
    expect(result).toBe('');
  });

  it('should return empty string for non-numeric length', () => {
    const options = { ...initialValues, length: 'abc' };
    const result = generatePassword(options);
    expect(result).toBe('');
  });

  it('should return empty string when no character types are selected', () => {
    const options = {
      ...initialValues,
      includeLowercase: false,
      includeUppercase: false,
      includeNumbers: false,
      includeSymbols: false
    };
    const result = generatePassword(options);
    expect(result).toBe('');
  });

  it('should only include lowercase letters when only lowercase is selected', () => {
    const options = {
      ...initialValues,
      length: '20',
      includeLowercase: true,
      includeUppercase: false,
      includeNumbers: false,
      includeSymbols: false
    };
    const result = generatePassword(options);
    expect(result).toMatch(/^[a-z]+$/);
    expect(result).toHaveLength(20);
  });

  it('should only include uppercase letters when only uppercase is selected', () => {
    const options = {
      ...initialValues,
      length: '15',
      includeLowercase: false,
      includeUppercase: true,
      includeNumbers: false,
      includeSymbols: false
    };
    const result = generatePassword(options);
    expect(result).toMatch(/^[A-Z]+$/);
    expect(result).toHaveLength(15);
  });

  it('should only include numbers when only numbers is selected', () => {
    const options = {
      ...initialValues,
      length: '8',
      includeLowercase: false,
      includeUppercase: false,
      includeNumbers: true,
      includeSymbols: false
    };
    const result = generatePassword(options);
    expect(result).toMatch(/^[0-9]+$/);
    expect(result).toHaveLength(8);
  });

  it('should include mixed character types when multiple are selected', () => {
    const options = {
      ...initialValues,
      length: '100', // larger sample for better testing
      includeLowercase: true,
      includeUppercase: true,
      includeNumbers: true,
      includeSymbols: false
    };
    const result = generatePassword(options);
    expect(result).toMatch(/^[a-zA-Z0-9]+$/);
    expect(result).toHaveLength(100);
  });

  it('should exclude ambiguous characters when avoidAmbiguous is true', () => {
    const options = {
      ...initialValues,
      length: '50',
      avoidAmbiguous: true
    };
    const result = generatePassword(options);
    expect(result).not.toMatch(/[iIl0O]/);
    expect(result).toHaveLength(50);
  });

  it('should include symbols when includeSymbols is true', () => {
    const options = {
      ...initialValues,
      length: '30',
      includeLowercase: false,
      includeUppercase: false,
      includeNumbers: false,
      includeSymbols: true
    };
    const result = generatePassword(options);
    expect(result).toMatch(/^[!@#$%^&*()_+~`|}{[\]:;?><,./-=]+$/);
    expect(result).toHaveLength(30);
  });

  it('should exclude ambiguous characters from symbols too', () => {
    const options = {
      ...initialValues,
      length: '50',
      includeLowercase: false,
      includeUppercase: false,
      includeNumbers: true,
      includeSymbols: true,
      avoidAmbiguous: true
    };
    const result = generatePassword(options);
    expect(result).not.toMatch(/[iIl0O]/);
    expect(result).toHaveLength(50);
  });

  it('should handle edge case with very short length', () => {
    const options = { ...initialValues, length: '1' };
    const result = generatePassword(options);
    expect(result).toHaveLength(1);
  });

  it('should handle negative length', () => {
    const options = { ...initialValues, length: '-5' };
    const result = generatePassword(options);
    expect(result).toBe('');
  });
});
