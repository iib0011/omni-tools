/**
 * Returns the file extension
 *
 * @param {string} filename - The filename
 * @return {string} - the file extension
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot <= 0) return ''; // No extension
  return filename.slice(lastDot + 1).toLowerCase();
}
