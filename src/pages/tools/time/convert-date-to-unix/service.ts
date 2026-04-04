// Changing a Date Object Into Unix
function computeDateToUnix(input: string, useLocalTime: boolean): string {
  try {
    // Extract Data
    const splitInput = input.split(' ');
    const timeFrame = splitInput[0] + ' ' + splitInput[1];
    const utcOffset = splitInput.length > 2 ? splitInput[2] : null;

    // Convert into Unix
    const rawUnixValue: number = Date.parse(timeFrame) / 1000;

    // Unsuccesful Conversion
    if (isNaN(rawUnixValue)) {
      return 'Invalid Date Time';
    }

    // Case 1: Base Scenario (Not Local, No Offsets)
    if (!useLocalTime && !utcOffset) {
      return `${rawUnixValue}`;
    }

    if (useLocalTime) {
      // Get User Time Zone
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('Time Zone is ', timeZone);
    }

    return `Valid Date`;
  } catch (err) {
    // Not Using Local Time (Either UTC is Given or Assume +00)
    console.log('Error', err);
    return 'Invalid Date Time';
  }
}

export function convertToUnix(input: string, useLocalTime: boolean): string {
  // Empty Input
  if (!input) return '';

  const result: string[] = [];
  const lines = input.split('\n');

  // Process Input Lines
  lines.forEach((line) => {
    const formattedDate = computeDateToUnix(line, useLocalTime);
    result.push(formattedDate);
  });

  return result.join('\n');
}
