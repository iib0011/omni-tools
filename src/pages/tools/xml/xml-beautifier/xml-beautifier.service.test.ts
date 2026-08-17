import { expect, describe, it } from 'vitest';
import { beautifyXml } from './service';

describe('xml-beautifier', () => {
  it('beautifies valid XML', () => {
    const input = '<root><a>1</a><b>2</b></root>';
    const result = beautifyXml(input, {});
    expect(result).toContain('<root>');
    expect(result).toContain('  <a>1</a>');
    expect(result).toContain('  <b>2</b>');
  });

  it('preserves attributes while beautifying XML', () => {
    const input = '<root><user id="42" role="admin">Alice</user></root>';
    const result = beautifyXml(input, {});

    expect(result).toContain('<user id="42" role="admin">Alice</user>');
  });

  it('returns error for invalid XML', () => {
    const input = '<root><a>1</b></root>';
    const result = beautifyXml(input, {});
    expect(result).toMatch(/Invalid XML/i);
  });
});
