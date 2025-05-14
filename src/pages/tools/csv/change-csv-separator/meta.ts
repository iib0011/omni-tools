import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  name: 'Change CSV separator',
  path: 'change-csv-separator',
  icon: 'material-symbols:split-scene-rounded',
  description:
    'Just upload your CSV file in the form below and it will automatically get a new column delimiter character. In the tool options, you can specify which delimiter and quote characters are used in the source CSV file and customize the desired delimiter and quote characters for the output CSV. You can also filter the input CSV before the conversion process and skip blank lines and comment lines.',
  shortDescription: 'Quickly change the CSV column delimiter to a new symbol.',
  keywords: ['change', 'csv', 'sepa rator'],
  longDescription:
    'This tool changes the field separator in CSV (Comma Separated Values) files. This is useful because different programs may use different default separators. While a comma is the most common separator in CSV files, some programs require files to be tab-separated (TSV), semicolon-separated (SSV), pipe-separated (PSV), or have another separation symbol. The default comma may not be so convenient as a delimiter in CSV files because commas are frequently present within fields. In such cases, it can be difficult and confusing to distinguish between commas as delimiters and commas as punctuation symbols. By replacing the comma with another delimiter, you can convert the file into a more easily readable and parsable format. In the options section of this tool, you can configure both the input and output CSV file formats. For the input CSV, you can specify its current delimiter (by default, it is a comma) and also indicate the quotation mark character used to wrap fields. For the output CSV, you can set a new delimiter, choose a new quotation mark character, and optionally enclose all the fields in quotes. Additionally, you have the option to remove empty lines from the input CSV and eliminate comment lines that start with a specified character (usually a hash "#" or double slashes "//"). Csv-abulous!',
  component: lazy(() => import('./index'))
});
