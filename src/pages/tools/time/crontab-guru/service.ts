import { InitialValuesType } from './types';
import cronstrue from 'cronstrue';
import { isValidCron } from 'cron-validator';

export function explainCrontab(expr: string): string {
  try {
    return cronstrue.toString(expr);
  } catch (e: any) {
    return `Invalid crontab expression: ${e.message}`;
  }
}

export function validateCrontab(expr: string): boolean {
  return isValidCron(expr, { seconds: false, allowBlankDay: true });
}

export function main(input: string, options: InitialValuesType): string {
  if (!input.trim()) return '';
  if (!validateCrontab(input)) {
    return 'Invalid crontab expression.';
  }
  return explainCrontab(input);
}
