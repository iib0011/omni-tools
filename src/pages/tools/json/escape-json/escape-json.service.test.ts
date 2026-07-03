import { describe, it, expect } from 'vitest';
import { escapeJson } from './service';

describe('escapeJson', () => {
  it('should escape a string', () => {
    const result = escapeJson('hello "world"', false);
    expect(result).toBe('hello \\"world\\"');
  });

  it('should wrap in quotes when flag is true', () => {
    const result = escapeJson('hello', true);
    expect(result).toBe('"hello"');
  });

  it('should handle special characters', () => {
    const result = escapeJson('line1\nline2', false);
    expect(result).toContain('\\n');
  });

  it('should handle backslashes', () => {
    const result = escapeJson('path\\to\\file', false);
    expect(result).toContain('\\\\');
  });

  it('should handle tabs', () => {
    const result = escapeJson('col1\tcol2', false);
    expect(result).toContain('\\t');
  });
});
