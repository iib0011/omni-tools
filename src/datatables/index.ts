import type { DataTable } from './types.ts';

export async function getDataTable(name: string): Promise<DataTable> {
  const allDataTables = (await import('./data/index')).default;
  return allDataTables[name];
}

/* Used in case later we want any kind of computed extra data */
export function dataTableLookup(table: DataTable, key: string): any {
  return table.data[key];
}

export async function listDataTables(): Promise<{ [name: string]: DataTable }> {
  const allDataTables = (await import('./data/index')).default;
  return allDataTables;
}

export { DataTable };
