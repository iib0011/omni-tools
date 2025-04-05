import type { DataTable } from '../types';
import wiregauge from './wire_gauge';
import material_electrical_properties from './material_electrical_properties';

const allDataTables: { [key: string]: DataTable } = {
  'wire-gauge': wiregauge,
  'material-electrical-properties': material_electrical_properties
};

export default allDataTables;
