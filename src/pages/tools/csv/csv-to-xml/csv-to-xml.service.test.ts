import { describe, expect, it } from 'vitest';
import { convertCsvToXml } from './service';

describe('convertCsvToXml', () => {
  const defaultOptions = {
    delimiter: ',',
    quote: '"',
    comment: '#',
    useHeaders: true,
    skipEmptyLines: true
  };

  it('should convert simple CSV with headers', () => {
    const result = convertCsvToXml('name,age\nJohn,30', defaultOptions);
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8" ?>\n<root>\n  <row id="0">\n    <name>John</name>\n    <age>30</age>\n  </row>\n</root>`
    );
  });

  it('should return empty root for empty input', () => {
    const result = convertCsvToXml('', defaultOptions);
    expect(result).toEqual(
      `<?xml version="1.0" encoding="UTF-8" ?>\n<root></root>`
    );
  });

  it('should escape ampersands in cell values (#405)', () => {
    const result = convertCsvToXml('name\nA&B', defaultOptions);
    expect(result).toContain('<name>A&amp;B</name>');
  });

  it('should escape angle brackets and quotes in cell values', () => {
    const result = convertCsvToXml(
      `name,note\n<script>,"say ""hi"" & 'bye'"`,
      defaultOptions
    );
    expect(result).toContain('<name>&lt;script&gt;</name>');
    expect(result).toContain('<note>say hi &amp; &apos;bye&apos;</note>');
  });

  it('should sanitize header names into valid XML tag names', () => {
    const result = convertCsvToXml('first name,a&b\nJohn,yes', defaultOptions);
    expect(result).toContain('<first_name>John</first_name>');
    expect(result).toContain('<a_b>yes</a_b>');
  });

  it('should prefix numeric header names', () => {
    const result = convertCsvToXml('2024\nvalue', defaultOptions);
    expect(result).toContain('<column-2024>value</column-2024>');
  });

  it('should skip comment lines', () => {
    const result = convertCsvToXml('name\n#comment\nJohn', defaultOptions);
    expect(result).not.toContain('comment');
    expect(result).toContain('<name>John</name>');
  });
});
