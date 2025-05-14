import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  name: 'Find incomplete CSV records',
  path: 'find-incomplete-csv-records',
  icon: 'tdesign:search-error',
  description:
    'Just upload your CSV file in the form below and this tool will automatically check if none of the rows or columns are missing values. In the tool options, you can adjust the input file format (specify the delimiter, quote character, and comment character). Additionally, you can enable checking for empty values, skip empty lines, and set a limit on the number of error messages in the output.',
  shortDescription:
    'Quickly find rows and columns in CSV that are missing values.',
  keywords: ['find', 'incomplete', 'csv', 'records'],
  longDescription:
    'This tool checks the completeness of CSV (Comma Separated Values) files and identifies incomplete records within the data. It finds rows and columns where one or more values are missing and displays their positions in the output so that you can quickly find and fix your CSV file. A valid CSV file has the same number of values (fields) in all rows and the same number of values (fields) in all columns. If the CSV you load in this tool is complete, the program will notify you with a green badge. If at least one value is missing in any row or column, the program will show a red badge and indicate the exact location of the missing value. If the CSV file has a field with no characters in it, then such a field is called an empty field. It is not a missing field, just empty as it contains nothing. You can activate the "Find Empty Values" checkbox in the options to identify all such fields in the CSV. If the file contains empty lines, you can ignore them with the "Skip Empty Lines" option or check them for completeness along with other lines. You can also configure the delimiter, quote, and comment characters in the options. This allows you to adapt to other file formats besides CSV, such as TSV (Tab Separated Values), SSV (Semicolon Separated Values), or PSV (Pipe Separated Values). If the file has too many incomplete or empty records, you can set a limit on the output messages to display, for example, 5, 10, or 20 messages. If you want to quickly fill in the missing data with default values, you can use our Fill Incomplete CSV Records tool. Csv-abulous!',
  component: lazy(() => import('./index'))
});
