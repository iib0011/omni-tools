import { power } from 'units-converter';
import GenericConverter from './GenericConverter';

const CLASSIC_UNITS = ['W', 'kW', 'MW', 'GW', 'mW'];

export default function PowerConverter() {
  return (
    <GenericConverter
      converter={power}
      classicUnits={CLASSIC_UNITS}
      defaultFrom="W"
      defaultTo="kW"
      title="Power Converter"
    />
  );
}
