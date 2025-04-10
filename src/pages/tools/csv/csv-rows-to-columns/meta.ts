import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  name: 'Convert CSV Rows to Columns',
  path: 'csv-rows-to-columns',
  icon: 'fluent:text-arrow-down-right-column-24-filled',
  description:
    'This tool converts rows of a CSV (Comma Separated Values) file into columns. It extracts the horizontal lines from the input CSV one by one, rotates them 90 degrees, and outputs them as vertical columns one after another, separated by commas.',
  longDescription:
    'This tool converts rows of a CSV (Comma Separated Values) file into columns. For example, if the input CSV data has 6 rows, then the output will have 6 columns and the elements of the rows will be arranged from the top to bottom. In a well-formed CSV, the number of values in each row is the same. However, in cases when rows are missing fields, the program can fix them and you can choose from the available options: fill missing data with empty elements or replace missing data with custom elements, such as "missing", "?", or "x". During the conversion process, the tool also cleans the CSV file from unnecessary information, such as empty lines (these are lines without visible information) and comments. To help the tool correctly identify comments, in the options, you can specify the symbol at the beginning of a line that starts a comment. This symbol is typically a hash "#" or double slash "//". Csv-abulous!.',
  shortDescription: 'Convert CSV rows to columns.',
  keywords: ['csv', 'rows', 'columns', 'transpose'],
  component: lazy(() => import('./index'))
});
