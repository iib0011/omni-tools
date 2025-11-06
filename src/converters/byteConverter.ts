/**
 * Byte Converter Utility
 * Converts between Bytes, KB, MB, GB, and TB
 *
 * Example:
 *   convertBytes(1024, "KB", "MB") => 1
 */

export type ByteUnit = "B" | "KB" | "MB" | "GB" | "TB";

export function convertBytes(value: number, fromUnit: ByteUnit, toUnit: ByteUnit): number {
  const units: ByteUnit[] = ["B", "KB", "MB", "GB", "TB"];

  if (!units.includes(fromUnit) || !units.includes(toUnit)) {
    throw new Error(`Invalid unit. Use one of: ${units.join(", ")}`);
  }

  const powerDifference = units.indexOf(toUnit) - units.indexOf(fromUnit);
  return value / Math.pow(1024, powerDifference);
}

// Optional helper for quick conversions in CLI or UI
export function formatConversion(value: number, fromUnit: ByteUnit, toUnit: ByteUnit): string {
  const result = convertBytes(value, fromUnit, toUnit);
  return `${value} ${fromUnit} = ${result} ${toUnit}`;
}
