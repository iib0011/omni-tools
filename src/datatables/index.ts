import type { DataTable } from './types.ts';
import { allDataTables } from './data/index';

export async function getDataTable(name: string): Promise<DataTable> {
  const x = await import(`./${name}`);
  return x.default;
}

export async function listDataTables(): Promise<{ name: string }[]> {
  const x: { name: string }[] = [];
  for (const key in allDataTables) {
    x.push({ name: key });
  }
  return x;
}

export { DataTable };
