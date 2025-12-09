import { temperature } from 'units-converter';
import GenericConverter from './GenericConverter';

const CLASSIC_UNITS = ['C', 'F', 'K', 'R'];

export default function TemperatureConverter() {
  return (
    <GenericConverter
      converter={temperature}
      classicUnits={CLASSIC_UNITS}
      defaultFrom="C"
      defaultTo="F"
      title="Temperature Converter"
    />
  );
}
