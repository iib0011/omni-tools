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

export function main(input: string, mode: string): string {
  if (!input.trim()) return '';

  // Cron to Description
  if (mode === 'cron-to-description') {
    if (!validateCrontab(input)) {
      return 'Invalid crontab expression.';
    }
    return explainCrontab(input);
  }

  // Description to Cron
  else {
    return convertDescriptionToCron(input);
  }
}

// Description to Cron
function convertDescriptionToCron(input: string): string {
  const fields = input.split('\n');
  const minutes = convertTime(fields[0].split(':')[1], 0, 59);
  const hours = convertTime(fields[1].split(':')[1], 0, 23);
  const dayOfMonth = convertTime(fields[2].split(':')[1], 1, 31);
  const month = convertTime(fields[3].split(':')[1], 1, 12);
  const dayOfWeek = convertTime(fields[4].split(':')[1], 0, 6);

  return `${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`;
}

// Units
function convertTime(rawInput: string, start: number, end: number): string {
  const input = rawInput.trim().toLowerCase().split(' ');

  // If Left Blank Assume It Means Every
  if (!rawInput || input.length === 0) return '*';

  try {
    // Single Unit
    if (
      input.length === 1 &&
      validateWithinRange(Number(input[0]), start, end)
    ) {
      return input[0];
    }

    // Every Unit
    if ((input[0] === 'every' || input[0] === '*') && input.length === 1) {
      return '*';
    }

    // Every N Units
    if (input[0] === 'every' && input.length === 2) {
      const value = Number(input[1]);
      if (validateWithinRange(value, start, end)) {
        return `*/${value}`;
      }

      // Invalid Input
      return '';
    }

    // Unit to Unit
    if (input.length === 3 && input[1] === 'to') {
      const rangeStart = Number(input[0]);
      const rangeEnd = Number(input[2]);

      if (
        validateWithinRange(rangeStart, start, end) &&
        validateWithinRange(rangeEnd, start, end) &&
        rangeStart < rangeEnd
      ) {
        return `${rangeStart}-${rangeEnd}`;
      }
    }

    // Unit AND Unit (Or Use Comma - Need Space In Between)
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
          if (validateWithinRange(currentNumber, start, end)) {
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

    // Range With Step (X to Y Every Z)
    if (input[1] === 'to' && input[3] === 'every' && input.length === 5) {
      const rangeStart = Number(input[0]);
      const rangeEnd = Number(input[2]);
      const step = Number(input[4]);

      if (
        validateWithinRange(rangeStart, start, end) &&
        validateWithinRange(rangeEnd, start, end) &&
        validateWithinRange(step, 1, end - start)
      ) {
        return `${rangeStart}-${rangeEnd}/${step}`;
      }
    }
  } catch (error) {
    return '';
  }

  return '';
}

// Validate Number, and Make Sure Input Falls Within Range
function validateWithinRange(
  input: number,
  start: number,
  end: number
): boolean {
  // Check if It's A Number, Not Negative and Is Integer (Not NaN)
  if (isNaN(input) || input < 0 || !Number.isInteger(input)) {
    return false;
  }

  // Check Within Range
  if (end >= input && input >= start) {
    return true;
  }
  return false;
}
