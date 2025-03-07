export function rot13(input: string): string {
  return input.replace(/[a-zA-Z]/g, (char) => {
    const charCode = char.charCodeAt(0);
    const baseCode = charCode >= 97 ? 97 : 65; // 'a' or 'A'
    return String.fromCharCode(((charCode - baseCode + 13) % 26) + baseCode);
  });
}
