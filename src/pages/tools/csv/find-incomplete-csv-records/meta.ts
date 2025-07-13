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
    'This tool allows you to find incomplete or missing records in CSV data. It can detect missing columns, empty values, and other data quality issues in your CSV files. You can customize the CSV parsing options and set limits on error reporting.',
  component: lazy(() => import('./index')),
  i18n: {
    name: 'csv.findIncompleteCsvRecords.name',
    description: 'csv.findIncompleteCsvRecords.description',
    shortDescription: 'csv.findIncompleteCsvRecords.shortDescription'
  }
});
