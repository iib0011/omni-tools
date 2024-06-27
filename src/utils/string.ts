export function capitalizeFirstLetter(string: string | undefined) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function isNumber(number: any) {
  return !isNaN(parseFloat(number)) && isFinite(number);
}