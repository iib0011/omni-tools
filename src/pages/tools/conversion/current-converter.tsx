import { current } from 'units-converter';
import GenericConverter from './GenericConverter';

const CLASSIC_UNITS = ['A', 'mA', 'kA'];

export default function CurrentConverter() {
  return (
    <GenericConverter
      converter={current}
      classicUnits={CLASSIC_UNITS}
      defaultFrom="A"
      defaultTo="mA"
      title="Current Converter"
    />
  );
}
