import { energy } from 'units-converter';
import GenericConverter from './GenericConverter';

const CLASSIC_UNITS = ['J', 'Wh', 'kWh', 'cal', 'kcal'];

export default function EnergyConverter() {
  return (
    <GenericConverter
      converter={energy}
      classicUnits={CLASSIC_UNITS}
      defaultFrom="J"
      defaultTo="kWh"
      title="Energy Converter"
    />
  );
}
