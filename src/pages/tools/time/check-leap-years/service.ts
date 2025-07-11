function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function checkLeapYear(input: string): string {
  if (!input) return '';

  const years = input
    .split('\n')
    .map((year) => year.trim())
    .filter((year) => year !== '');

  const results = years.map((yearStr) => {
    if (!/^\d{1,4}$/.test(yearStr)) {
      return `${yearStr}: Invalid year`;
    }

    const year = Number(yearStr);
    return `${year} ${
      isLeapYear(year) ? 'is a leap year.' : 'is not a leap year.'
    }`;
  });

  return results.join('\n');
}
