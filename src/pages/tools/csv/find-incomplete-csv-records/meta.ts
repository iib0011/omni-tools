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
    'This tool analyzes CSV files to identify incomplete records where data is missing. It checks both rows and columns for missing values and provides detailed reports on data quality issues. Useful for data validation and quality assurance.',
  userTypes: ['Developers'],
  component: lazy(() => import('./index'))
});
