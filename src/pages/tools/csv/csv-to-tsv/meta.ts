import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  name: 'Convert CSV to TSV',
  path: 'csv-to-tsv',
  icon: 'codicon:keyboard-tab',
  description:
    'Upload your CSV file in the form below and it will automatically get converted to a TSV file. In the tool options, you can customize the input CSV format – specify the field delimiter, quotation character, and comment symbol, as well as skip empty CSV lines, and choose whether to preserve CSV column headers.',
  shortDescription: 'Convert CSV data to TSV format.',
  longDescription:
    'This tool transforms Comma Separated Values (CSV) data to Tab Separated Values (TSV) data. Both CSV and TSV are popular file formats for storing tabular data but they use different delimiters to separate values – CSV uses commas (","), while TSV uses tabs ("\t"). If we compare CSV files to TSV files, then CSV files are much harder to parse than TSV files because the values themselves may contain commas, so it is not always obvious where one field starts and ends without complicated parsing rules. TSV, on the other hand, uses just a tab symbol, which does not usually appear in data, so separating fields in TSV is as simple as splitting the input by the tab character. To convert CSV to TSV, simply input the CSV data in the input of this tool. In rare cases when a CSV file has a delimiter other than a comma, you can specify the current delimiter in the options of the tool. You can also specify the current quote character and the comment start character. Additionally, empty CSV lines can be skipped by activating the "Ignore Lines with No Data" option. If this option is off, then empty lines in the CSV are converted to empty TSV lines. The "Preserve Headers" option allows you to choose whether to process column headers of a CSV file. If the option is selected, then the resulting TSV file will include the first row of the input CSV file, which contains the column names. Alternatively, if the headers option is not selected, the first row will be skipped during the data conversion process. For the reverse conversion from TSV to CSV, you can use our Convert TSV to CSV tool. Csv-abulous!',
  keywords: ['csv', 'tsv', 'convert', 'transform', 'parse'],
  userTypes: ['Developers'],
  component: lazy(() => import('./index'))
});
