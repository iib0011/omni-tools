import { Unit, UnitCategory, ConversionResult } from './types';

// ─── Definition of units by category ─────────────────────────────────────────

export const unitsByCategory: Record<UnitCategory, Unit[]> = {
  length: [
    { label: 'Millimeter', symbol: 'mm', toBase: 0.001 },
    { label: 'Centimeter', symbol: 'cm', toBase: 0.01 },
    { label: 'Meter', symbol: 'm', toBase: 1 },
    { label: 'Kilometer', symbol: 'km', toBase: 1000 },
    { label: 'Inch', symbol: 'in', toBase: 0.0254 },
    { label: 'Foot', symbol: 'ft', toBase: 0.3048 },
    { label: 'Yard', symbol: 'yd', toBase: 0.9144 },
    { label: 'Mile', symbol: 'mi', toBase: 1609.344 },
    { label: 'Nautical Mile', symbol: 'nmi', toBase: 1852 }
  ],
  weight: [
    { label: 'Milligram', symbol: 'mg', toBase: 0.000001 },
    { label: 'Gram', symbol: 'g', toBase: 0.001 },
    { label: 'Kilogram', symbol: 'kg', toBase: 1 },
    { label: 'Metric Ton', symbol: 't', toBase: 1000 },
    { label: 'Ounce', symbol: 'oz', toBase: 0.0283495 },
    { label: 'Pound', symbol: 'lb', toBase: 0.453592 },
    { label: 'Stone', symbol: 'st', toBase: 6.35029 }
  ],
  temperature: [
    { label: 'Celsius', symbol: '°C' },
    { label: 'Fahrenheit', symbol: '°F' },
    { label: 'Kelvin', symbol: 'K' },
    { label: 'Rankine', symbol: '°R' }
  ],
  speed: [
    { label: 'Meters/second', symbol: 'm/s', toBase: 1 },
    { label: 'Kilometers/hour', symbol: 'km/h', toBase: 0.277778 },
    { label: 'Miles/hour', symbol: 'mph', toBase: 0.44704 },
    { label: 'Knots', symbol: 'kn', toBase: 0.514444 },
    { label: 'Feet/second', symbol: 'ft/s', toBase: 0.3048 },
    { label: 'Mach', symbol: 'Ma', toBase: 340.29 }
  ],
  area: [
    { label: 'Square Millimeter', symbol: 'mm²', toBase: 0.000001 },
    { label: 'Square Centimeter', symbol: 'cm²', toBase: 0.0001 },
    { label: 'Square Meter', symbol: 'm²', toBase: 1 },
    { label: 'Square Kilometer', symbol: 'km²', toBase: 1_000_000 },
    { label: 'Square Inch', symbol: 'in²', toBase: 0.00064516 },
    { label: 'Square Foot', symbol: 'ft²', toBase: 0.092903 },
    { label: 'Square Yard', symbol: 'yd²', toBase: 0.836127 },
    { label: 'Acre', symbol: 'ac', toBase: 4046.86 },
    { label: 'Hectare', symbol: 'ha', toBase: 10000 }
  ],
  volume: [
    { label: 'Milliliter', symbol: 'mL', toBase: 0.001 },
    { label: 'Liter', symbol: 'L', toBase: 1 },
    { label: 'Cubic Meter', symbol: 'm³', toBase: 1000 },
    { label: 'Teaspoon (US)', symbol: 'tsp', toBase: 0.00492892 },
    { label: 'Tablespoon (US)', symbol: 'tbsp', toBase: 0.0147868 },
    { label: 'Fluid Ounce (US)', symbol: 'fl oz', toBase: 0.0295735 },
    { label: 'Cup (US)', symbol: 'cup', toBase: 0.236588 },
    { label: 'Pint (US)', symbol: 'pt', toBase: 0.473176 },
    { label: 'Quart (US)', symbol: 'qt', toBase: 0.946353 },
    { label: 'Gallon (US)', symbol: 'gal', toBase: 3.78541 },
    { label: 'Cubic Inch', symbol: 'in³', toBase: 0.0163871 },
    { label: 'Cubic Foot', symbol: 'ft³', toBase: 28.3168 }
  ]
};

// ─── Temperature conversion (special cases without linear toBase) ────────────

function convertTemperature(
  value: number,
  from: string,
  to: string
): { value: number; formula: string } {
  // convert from → Celsius first
  let celsius: number;
  switch (from) {
    case '°C':
      celsius = value;
      break;
    case '°F':
      celsius = (value - 32) / 1.8;
      break;
    case 'K':
      celsius = value - 273.15;
      break;
    case '°R':
      celsius = (value - 491.67) / 1.8;
      break;
    default:
      celsius = value;
  }

  // convert Celsius → to
  let result: number;
  let formula: string;
  switch (to) {
    case '°C':
      result = celsius;
      formula = buildTempFormula(value, from, '°C');
      break;
    case '°F':
      result = celsius * 1.8 + 32;
      formula = buildTempFormula(value, from, '°F');
      break;
    case 'K':
      result = celsius + 273.15;
      formula = buildTempFormula(value, from, 'K');
      break;
    case '°R':
      result = (celsius + 273.15) * 1.8;
      formula = buildTempFormula(value, from, '°R');
      break;
    default:
      result = celsius;
      formula = `${value} ${from} = ${celsius} °C`;
  }

  return { value: result, formula };
}

function buildTempFormula(value: number, from: string, to: string): string {
  const map: Record<string, Record<string, string>> = {
    '°C': {
      '°F': `(${value} × 9/5) + 32`,
      K: `${value} + 273.15`,
      '°R': `(${value} + 273.15) × 9/5`
    },
    '°F': {
      '°C': `(${value} − 32) × 5/9`,
      K: `(${value} + 459.67) × 5/9`,
      '°R': `${value} + 459.67`
    },
    K: {
      '°C': `${value} − 273.15`,
      '°F': `(${value} × 9/5) − 459.67`,
      '°R': `${value} × 9/5`
    },
    '°R': {
      '°C': `(${value} − 491.67) × 5/9`,
      '°F': `${value} − 459.67`,
      K: `${value} × 5/9`
    }
  };
  return map[from]?.[to] ?? `${value} ${from} → ${to}`;
}

// ─── Generic conversion via toBase factor ───────────────────────────────────

function buildLinearFormula(
  value: number,
  fromSymbol: string,
  toSymbol: string,
  factor: number
): string {
  if (factor === 1) return `${value} ${fromSymbol} = ${value} ${toSymbol}`;
  return `${value} × ${
    factor % 1 === 0 ? factor : factor.toPrecision(6)
  } = result (${fromSymbol} → ${toSymbol})`;
}

// ─── Main exported function ────────────────────────────────────────────────

export function convertUnit(
  value: number,
  category: UnitCategory,
  fromSymbol: string,
  precision: number
): ConversionResult[] {
  const units = unitsByCategory[category];

  if (category === 'temperature') {
    return units
      .filter((u) => u.symbol !== fromSymbol)
      .map((toUnit) => {
        const { value: converted, formula } = convertTemperature(
          value,
          fromSymbol,
          toUnit.symbol
        );
        return {
          unit: toUnit,
          value: parseFloat(converted.toFixed(precision)),
          formula
        };
      });
  }

  const fromUnit = units.find((u) => u.symbol === fromSymbol);
  if (!fromUnit?.toBase) return [];

  return units
    .filter((u) => u.symbol !== fromSymbol)
    .map((toUnit) => {
      const factor = fromUnit.toBase! / toUnit.toBase!;
      const converted = value * factor;
      return {
        unit: toUnit,
        value: parseFloat(converted.toFixed(precision)),
        formula: buildLinearFormula(value, fromSymbol, toUnit.symbol, factor)
      };
    });
}
