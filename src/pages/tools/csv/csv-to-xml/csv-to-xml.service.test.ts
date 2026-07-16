import { describe, it, expect } from 'vitest';
import { convertCsvToXml } from './service';

describe('CsvToXml Service', () => {
  const defaultOptions = {
    delimiter: ',',
    quote: '"',
    comment: '#',
    useHeaders: true,
    skipEmptyLines: true
  };

  it('should escape ampersands in cell values to produce valid XML', () => {
    const csvInput = 'name\nA&B';
    const result = convertCsvToXml(csvInput, defaultOptions);

    expect(result).toContain('<name>A&amp;B</name>');
    expect(result).toContain('<?xml version="1.0" encoding="UTF-8" ?>');
  });

  it('should leave normal text without metacharacters untouched', () => {
    const csvInput = 'name\nA and B';
    const result = convertCsvToXml(csvInput, defaultOptions);

    expect(result).toContain('<name>A and B</name>');
  });

  it('shold escape all dangerous XML characters in CSV values', () => {
    const csvInput = 'value\n<tag> text & text';
    const result = convertCsvToXml(csvInput, defaultOptions);

    expect(result).toContain('<value>&lt;tag&gt; text &amp; text</value>');
  });
});
