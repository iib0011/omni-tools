import { voltage } from 'units-converter';
import GenericConverter from './GenericConverter';

const CLASSIC_UNITS = ['V', 'mV', 'kV'];

export default function VoltageConverter() {
  return (
    <GenericConverter
      converter={voltage}
      classicUnits={CLASSIC_UNITS}
      defaultFrom="V"
      defaultTo="kV"
      title="Voltage Converter"
    />
  );
}
