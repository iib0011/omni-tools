import cronstrue from 'cronstrue';
import { isValidCron } from 'cron-validator';

// Cron to Description
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

export function main(input: string, _options: any): string {
  if (!input.trim()) return '';
  if (!validateCrontab(input)) {
    return 'Invalid crontab expression.';
  }
  return explainCrontab(input);
}

// Description to Cron
// Minutes
function convertMinutes(minutes: string) {
  minutes = minutes.trim().toLowerCase();

  // Split Based Off Spaces
  const input = minutes.split(' ');

  // If Left Blank Assume It Means Every
  if (!minutes) return '*';

  try {
    // Every Minute
    if (input[0] === 'every' && input.length === 1) {
      return '*';
    }

    // Every N Minutes
    if (input[0] === 'every' && input.length === 2) {
      const value = Number(input[1]);
      if (59 >= value && value >= 0) {
        return `*/${value}`;
      }

      // Invalid Input
      return '';
    }

    // Minute to Minute
  } catch (error) {
    return '';
  }
}
