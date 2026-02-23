// Converts a Date object to a Discord timestamp string
export function generateDiscordTimestamp(date: Date, format: string = 'F') {
  const unix = Math.floor(date.getTime() / 1000);
  return `<t:${unix}:${format}>`;
}

// Attempts to parse a Discord timestamp like <t:1712345678:F>
// Returns a Date object or null if invalid
export function parseDiscordTimestamp(input: string): Date | null {
  const match = input.trim().match(/^<t:(\d+):[A-Za-z]>$/);
  if (!match) return null;

  const unix = Number(match[1]);
  const date = new Date(unix * 1000);
  return isNaN(date.getTime()) ? null : date;
}
