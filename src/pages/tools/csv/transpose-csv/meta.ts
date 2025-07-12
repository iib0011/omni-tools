import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  name: 'Transpose CSV',
  path: 'transpose-csv',
  icon: 'carbon:transpose',
  description:
    'Just upload your CSV file in the form below, and this tool will automatically transpose your CSV. In the tool options, you can specify the character that starts the comment lines in the CSV to remove them. Additionally, if the CSV is incomplete (missing values), you can replace missing values with the empty character or a custom character.',
  shortDescription: 'Quickly transpose a CSV file.',
  keywords: ['transpose', 'csv'],
  longDescription:
    'This tool transposes Comma Separated Values (CSV). It treats the CSV as a matrix of data and flips all elements across the main diagonal. The output contains the same CSV data as the input, but now all the rows have become columns, and all the columns have become rows. After transposition, the CSV file will have opposite dimensions. For example, if the input file has 4 columns and 3 rows, the output file will have 3 columns and 4 rows. During conversion, the program also cleans the data from unnecessary lines and corrects incomplete data. Specifically, the tool automatically deletes all empty records and comments that begin with a specific character, which you can set in the option. Additionally, in cases where the CSV data is corrupted or lost, the utility completes the file with empty fields or custom fields that can be specified in the options. Csv-abulous!',
  userTypes: ['Developers'],
  component: lazy(() => import('./index'))
});
