import { DiscordTimestampFormat, InitialValuesType } from './types';

/**
 * Converts a Date object into a Discord timestamp string.
 *
 * @param date   JavaScript Date object to convert.
 * @param format Discord timestamp format.
 *               Allowed values: 't', 'T', 'd', 'D', 'f', 'F', 'R'.
 *               Defaults to 'F' (full date and time).
 *
 * @returns Discord-formatted timestamp string.
 */
export function compute(
  date: Date,
  format: DiscordTimestampFormat = 'F'
): string {
  const unix = Math.floor(date.getTime() / 1000);
  return `<t:${unix}:${format}>`;
}

/**
 * Converts a multiline string of datetime values into Discord timestamp strings.
 *
 * Processes each line independently:
 * - Blank lines are preserved as-is in the output.
 * - Valid datetime strings are converted to Discord timestamp format.
 * - Invalid or unparseable lines show error message.
 *
 * @param input   Multiline string where each line is an UTC datetime value.
 * @param options - `format`: Discord timestamp format ('t', 'T', 'd', 'D', 'f', 'F', 'R').
 *                - `enforceUTC`: if true, input is treated as UTC; otherwise as local time.
 *
 * @returns Multiline string with each valid datetime replaced by a Discord timestamp.
 */
export function DiscordTimestampGenerator(
  input: string,
  options: InitialValuesType
): string {
  if (!input) return '';

  const { format, enforceUTC } = options;

  const results: string[] = [];

  input.split('\n').forEach((datetime) => {
    if (!datetime.trim()) {
      results.push(''); // Blank lines stays
      return;
    }

    const raw = datetime.trim();
    const date = enforceUTC ? new Date(raw + 'Z') : new Date(raw);
    if (!isNaN(date.getTime())) {
      results.push(compute(date, format));
    } else {
      results.push(`❌  ${datetime}`); // keep original if unparseable
    }
  });

  return results.join('\n');
}
