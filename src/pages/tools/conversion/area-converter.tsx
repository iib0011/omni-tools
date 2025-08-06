import { area } from 'units-converter';
import GenericConverter from './GenericConverter';

const CLASSIC_UNITS = ['m2', 'km2', 'cm2', 'ha', 'ac', 'ft2', 'yd2'];

export default function AreaConverter() {
  return (
    <GenericConverter
      converter={area}
      classicUnits={CLASSIC_UNITS}
      defaultFrom="m2"
      defaultTo="km2"
      title="Area Converter"
    />
  );
}
