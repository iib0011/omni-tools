import { describe, it, expect } from 'vitest';
import { convertCsvToXml } from './service';

const defaultOptions = {
  delimiter: ',',
  quote: '"',
  comment: '#',
  useHeaders: true,
  skipEmptyLines: true
};

describe('convertCsvToXml', () => {
  it('should convert basic CSV to XML with headers', () => {
    const result = convertCsvToXml('name,age\nJohn,30\nAlice,25', defaultOptions);
    expect(result).toContain('<name>John</name>');
    expect(result).toContain('<name>Alice</name>');
    expect(result).toContain('<age>30</age>');
    expect(result).toContain('<age>25</age>');
  });

  it('should escape ampersands in cell values', () => {
    const result = convertCsvToXml('name\nA&B', defaultOptions);
    expect(result).toContain('<name>A&amp;B</name>');
    expect(result).not.toContain('<name>A&B</name>');
  });

  it('should escape less-than and greater-than in cell values', () => {
    const result = convertCsvToXml('name\n<tag>', defaultOptions);
    expect(result).toContain('<name>&lt;tag&gt;</name>');
  });

  it('should escape double quotes in cell values', () => {
    const result = convertCsvToXml('name\nsay "hello"', defaultOptions);
    expect(result).toContain('&quot;');
  });

  it('should handle normal data without corruption', () => {
    const result = convertCsvToXml('name,age,city\nJohn,30,New York', defaultOptions);
    expect(result).toContain('<name>John</name>');
    expect(result).toContain('<age>30</age>');
    expect(result).toContain('<city>New York</city>');
  });

  it('should sanitize header names containing spaces', () => {
    const result = convertCsvToXml('first name,last name\nJohn,Doe', defaultOptions);
    expect(result).toContain('<first_name>John</first_name>');
    expect(result).toContain('<last_name>Doe</last_name>');
  });

  it('should handle empty cell values', () => {
    const result = convertCsvToXml('name,age,city\nJohn,,', defaultOptions);
    expect(result).toContain('<name>John</name>');
    expect(result).toContain('<age></age>');
    expect(result).toContain('<city></city>');
  });

  it('should return empty root element for empty input', () => {
    const result = convertCsvToXml('', defaultOptions);
    expect(result).toBe('<?xml version="1.0" encoding="UTF-8" ?>\n<root></root>');
  });

  it('should include XML declaration', () => {
    const result = convertCsvToXml('name\nJohn', defaultOptions);
    expect(result).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
  });

  it('should escape all five XML special characters', () => {
    const result = convertCsvToXml('name\n& < > " \'', defaultOptions);
    expect(result).toContain('&amp;');
    expect(result).toContain('&lt;');
    expect(result).toContain('&gt;');
    expect(result).toContain('&quot;');
    expect(result).toContain('&apos;');
  });
});
