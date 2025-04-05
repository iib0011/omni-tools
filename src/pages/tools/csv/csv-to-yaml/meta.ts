import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  name: 'Csv to yaml',
  path: 'csv-to-yaml',
  icon: 'nonicons:yaml-16',
  description:
    'Just upload your CSV file in the form below and it will automatically get converted to a YAML file. In the tool options, you can specify the field delimiter character, field quote character, and comment character to adapt the tool to custom CSV formats. Additionally, you can select the output YAML format: one that preserves CSV headers or one that excludes CSV headers.',
  shortDescription: 'Quickly convert a CSV file to a YAML file.',
  keywords: ['csv', 'to', 'yaml'],
  longDescription:
    'This tool transforms CSV (Comma Separated Values) data into the YAML (Yet Another Markup Language) data. CSV is a simple, tabular format that is used to represent matrix-like data types consisting of rows and columns. YAML, on the other hand, is a more advanced format (actually a superset of JSON), which creates more human-readable data for serialization, and it supports lists, dictionaries, and nested objects. This program supports various input CSV formats – the input data can be comma-separated (default), semicolon-separated, pipe-separated, or use another completely different delimiter. You can specify the exact delimiter your data uses in the options. Similarly, in the options, you can specify the quote character that is used to wrap CSV fields (by default a double-quote symbol). You can also skip lines that start with comments by specifying the comment symbols in the options. This allows you to keep your data clean by skipping unnecessary lines. There are two ways to convert CSV to YAML. The first method converts each CSV row into a YAML list. The second method extracts headers from the first CSV row and creates YAML objects with keys based on these headers. You can also customize the output YAML format by specifying the number of spaces for indenting YAML structures. If you need to perform the reverse conversion, that is, transform YAML into CSV, you can use our Convert YAML to CSV tool. Csv-abulous!',
  component: lazy(() => import('./index'))
});
