import { expect, describe, it } from 'vitest';
import { validateCrontab, explainCrontab } from './service';

describe('crontab-guru service', () => {
  it('validates correct crontab expressions', () => {
    expect(validateCrontab('35 16 * * 0-5')).toBe(true);
    expect(validateCrontab('* * * * *')).toBe(true);
    expect(validateCrontab('0 12 1 * *')).toBe(true);
  });

  it('invalidates incorrect crontab expressions', () => {
    expect(validateCrontab('invalid expression')).toBe(false);
    expect(validateCrontab('61 24 * * *')).toBe(false);
  });

  it('explains valid crontab expressions', () => {
    expect(explainCrontab('35 16 * * 0-5')).toMatch(/At 04:35 PM/);
    expect(explainCrontab('* * * * *')).toMatch(/Every minute/);
  });

  it('returns error for invalid crontab explanation', () => {
    expect(explainCrontab('invalid expression')).toMatch(
      /Invalid crontab expression/
    );
  });
});
