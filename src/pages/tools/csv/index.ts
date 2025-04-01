import { tool as csvToJson } from './csv-to-json/meta';
import { tool as csvToXml } from './csv-to-xml/meta';
import { tool as csvToRowsColumns } from './csv-rows-to-columns/meta';
import { tool as csvToTsv } from './csv-to-tsv/meta';
import { tool as swapCsvColumns } from './swap-csv-columns/meta';

export const csvTools = [
  csvToJson,
  csvToXml,
  csvToRowsColumns,
  csvToTsv,
  swapCsvColumns
];
