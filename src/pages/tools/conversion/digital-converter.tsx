import { digital } from 'units-converter';
import GenericConverter from './GenericConverter';

const CLASSIC_UNITS = [
  'B',
  'KB',
  'MB',
  'GB',
  'TB',
  'b',
  'Kb',
  'Mb',
  'Gb',
  'Tb'
];

export default function DigitalConverter() {
  return (
    <GenericConverter
      converter={digital}
      classicUnits={CLASSIC_UNITS}
      defaultFrom="MB"
      defaultTo="GB"
      title="Digital Storage Converter"
    />
  );
}
