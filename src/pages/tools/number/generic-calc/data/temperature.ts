import type { GenericCalcType } from './types';

const temperatureConversion: GenericCalcType = {
  icon: 'carbon:temperature-inversion',
  keywords: ['temperature', 'conversion', 'celcius', 'fahrenheit', 'Kelvin'],
  shortDescription:
    'Convert temperatures between Celsius and Fahrenheit scales',
  name: 'Temperature Converter',
  path: 'temperaure-conversion',
  description: 'Convert temperatures between common scales',
  longDescription: `This calculator allows you to convert temperatures between Celsius, Fahrenheit, Kelvin, and Rankine. It is useful for scientists, engineers, students, and anyone needing to switch between these temperature scales for various applications.

Formulas Used:

Celsius (°C) ↔ Fahrenheit (°F): 
  °F = (°C × 9/5) + 32, and °C = (°F - 32) × 5/9 ||

Celsius (°C) ↔ Kelvin (K): 
  K = °C + 273.15, and °C = K - 273.15 ||

Celsius (°C) ↔ Rankine (°R): 
  °R = (°C + 273.15) × 9/5, and °C = (°R - 491.67) × 5/9  ||

Kelvin (K) ↔ Fahrenheit (°F): 
  °F = (K - 273.15) × 9/5 + 32, and K = (°F - 32) × 5/9 + 273.15  ||

Kelvin (K) ↔ Rankine (°R): 
  °R = K × 9/5, and K = °R × 5/9`,
  formula: 'TdegC = (TdegF - 32) * 5/9',
  presets: [],
  variables: [
    {
      name: 'TdegC',
      title: 'Celsius',
      unit: 'tempC'
    },
    {
      name: 'TdegF',
      title: 'Farenheit',
      unit: 'tempF',
      default: 32,
      alternates: [
        {
          title: 'Kelvin',
          formula: 'x = (v -32) * 5/9 + 273.15',
          unit: 'tempK'
        },
        {
          title: 'Rankine',
          formula: 'x = v + 459.67',
          unit: 'tempR'
        }
      ]
    }
  ]
};

export default temperatureConversion;
