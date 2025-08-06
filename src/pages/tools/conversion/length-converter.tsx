import { length } from 'units-converter';
import GenericConverter from './GenericConverter';

const CLASSIC_UNITS = ['m', 'km', 'cm', 'mm', 'mi', 'yd', 'ft', 'in'];

export default function LengthConverter() {
  return (
    <GenericConverter
      converter={length}
      classicUnits={CLASSIC_UNITS}
      defaultFrom="m"
      defaultTo="km"
      title="Length Converter"
    />
  );
}
