import { describe, expect, it } from 'vitest';
import { extractEmails } from './service';

describe('extractEmails', () => {
  it('should extract single email from text', () => {
    const input = 'Contact us at hello@example.com';
    const result = extractEmails(input, false);
    expect(result).toBe('hello@example.com');
  });

  it('should extract multiple emails from text', () => {
    const input = 'Emails: a@b.com, c@d.org, e@f.net';
    const result = extractEmails(input, false);
    expect(result).toBe('a@b.com\nc@d.org\ne@f.net');
  });

  it('should deduplicate emails when unique is true', () => {
    const input = 'test@test.com, test@test.com, other@test.com';
    const result = extractEmails(input, true);
    expect(result).toBe('test@test.com\nother@test.com');
  });

  it('should return empty string for input with no emails', () => {
    const input = 'This text has no email addresses.';
    const result = extractEmails(input, false);
    expect(result).toBe('');
  });

  it('should return empty string for empty input', () => {
    const result = extractEmails('', false);
    expect(result).toBe('');
  });

  it('should handle emails with subdomains', () => {
    const input = 'user@sub.example.com';
    const result = extractEmails(input, false);
    expect(result).toBe('user@sub.example.com');
  });

  it('should handle emails with plus addressing', () => {
    const input = 'user+tag@example.com';
    const result = extractEmails(input, false);
    expect(result).toBe('user+tag@example.com');
  });

  it('should handle emails with dots in local part', () => {
    const input = 'firstname.lastname@example.com';
    const result = extractEmails(input, false);
    expect(result).toBe('firstname.lastname@example.com');
  });
});
