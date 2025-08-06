import { volume } from 'units-converter';
import GenericConverter from './GenericConverter';

const CLASSIC_UNITS = ['L', 'm3', 'mL', 'cL', 'gal', 'qt', 'pt', 'cup', 'floz'];

export default function VolumeConverter() {
  return (
    <GenericConverter
      converter={volume}
      classicUnits={CLASSIC_UNITS}
      defaultFrom="L"
      defaultTo="m3"
      title="Volume Converter"
    />
  );
}
