type TimeValidationResult = {
  isValid: boolean;
  hours: number;
  minutes: number;
  seconds: number;
};

/**
 *  Validates human-readable time format (HH:MM or HH:MM:SS)
 * Supports either ':' or '.' as a separator, but not both
 * @param {string} input - string time format
 * * @returns {{
 *   isValid: boolean,  // true if the input is a valid time
 *   hours: number,     // parsed hours (0 or greater)
 *   minutes: number,   // parsed minutes (0-59)
 *   seconds: number    // parsed seconds (0-59, 0 if not provided)
 * }}
 */
export function humanTimeValidation(input: string): TimeValidationResult {
  const result = { isValid: false, hours: 0, minutes: 0, seconds: 0 };

  if (!input) return result;

  input = input.trim();

  // Operator use validation
  // use of one between these two operators '.' or ':'

  const hasColon = input.includes(':');
  const hasDot = input.includes('.');

  if (hasColon && hasDot) return result;

  if (!hasColon && !hasDot) return result;

  const separator = hasColon ? ':' : '.';

  // Time parts validation

  const parts = input.split(separator);

  if (parts.length < 2 || parts.length > 3) return result;

  const [h, m, s = '0'] = parts;

  // every character should be a digit
  if (![h, m, s].every((x) => /^\d+$/.test(x))) return result;

  const hours = parseInt(h);
  const minutes = parseInt(m);
  const seconds = parseInt(s);

  if (minutes < 0 || minutes > 59) return result;
  if (seconds < 0 || seconds > 59) return result;
  if (hours < 0) return result;

  return { isValid: true, hours, minutes, seconds };
}
