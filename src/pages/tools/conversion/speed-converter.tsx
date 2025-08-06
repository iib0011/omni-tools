import { speed } from 'units-converter';
import GenericConverter from './GenericConverter';

const CLASSIC_UNITS = ['km/h', 'm/s', 'mph', 'knot', 'ft/s'];

export default function SpeedConverter() {
  return (
    <GenericConverter
      converter={speed}
      classicUnits={CLASSIC_UNITS}
      defaultFrom="km/h"
      defaultTo="mph"
      title="Speed Converter"
    />
  );
}
