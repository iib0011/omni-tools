import { mass } from 'units-converter';
import GenericConverter from './GenericConverter';

const CLASSIC_UNITS = ['kg', 'g', 'mg', 'lb', 'oz', 'st', 'ton', 't'];

export default function MassConverter() {
  return (
    <GenericConverter
      converter={mass}
      classicUnits={CLASSIC_UNITS}
      defaultFrom="kg"
      defaultTo="g"
      title="Mass Converter"
    />
  );
}
