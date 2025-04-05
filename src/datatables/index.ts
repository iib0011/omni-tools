import type { DataTable } from './types.ts';

/* Used in case later we want any kind of computed extra data */
export function dataTableLookup(table: DataTable, key: string): any {
  return table.data[key];
}

export { DataTable };
