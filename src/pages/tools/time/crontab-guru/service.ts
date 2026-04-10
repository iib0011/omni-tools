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
    // Single Minute
    if (input.length === 1 && validateWithinRange(Number(input[0]), 0, 59)) {
      return input[0];
    }

    // Every Minute
    if (input[0] === 'every' && input.length === 1) {
      return '*';
    }

    // Every N Minutes
    if (input[0] === 'every' && input.length === 2) {
      const value = Number(input[1]);
      if (validateWithinRange(value, 0, 59)) {
        return `*/${value}`;
      }

      // Invalid Input
      return '';
    }

    // Minute to Minute
    if (input.length === 3 && input[1] === 'to') {
      const start = Number(input[0]);
      const end = Number(input[0]);

      if (
        validateWithinRange(start, 0, 59) &&
        validateWithinRange(end, 0, 59) &&
        start < end
      ) {
        return `${start}-${end}`;
      }
    }

    // Minute AND Minute (Or Use Comma)
    if (input.includes('and') || input.includes(',')) {
      let processedString = '';
      input.map((value, index) => {
        // Between Values Should Be Comma
        if ((value === 'and' || value === ',') && index % 2 === 1) {
          processedString = processedString + ',';
        }
        // Number
        else if (value !== 'and' && value !== ',' && index % 2 === 0) {
          const currentNumber = Number(value);
          if (validateWithinRange(currentNumber, 0, 59)) {
            processedString = processedString + `${currentNumber}`;
          } else {
            throw new Error('Number not in range');
          }
        }
        // Number or Connector At The Wrong Index
        else {
          throw new Error('Invalid Number');
        }
      });
      // Upon Completion
      return processedString;
    }
  } catch (error) {
    return '';
  }
}

function validateWithinRange(
  input: number,
  start: number,
  end: number
): boolean {
  // Check if It's A Number (Not NaN)
  if (isNaN(input)) {
    return false;
  }

  // Check Within Range
  if (end >= input && input >= start) {
    return true;
  }
  return false;
}
