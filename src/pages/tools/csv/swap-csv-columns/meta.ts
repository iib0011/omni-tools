import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('csv', {
  name: 'Swap CSV Columns',
  path: 'swap-csv-columns',
  icon: 'eva:swap-outline',
  description:
    'Just upload your CSV file in the form below, specify the columns to swap, and the tool will automatically change the positions of the specified columns in the output file. In the tool options, you can specify the column positions or names that you want to swap, as well as fix incomplete data and optionally remove empty records and records that have been commented out.',
  shortDescription: 'Reorder CSV columns.',
  longDescription:
    'This tool reorganizes CSV data by swapping the positions of its columns. Swapping columns can enhance the readability of a CSV file by placing frequently used data together or in the front for easier data comparison and editing. For example, you can swap the first column with the last or swap the second column with the third. To swap columns based on their positions, select the "Set Column Position" mode and enter the numbers of the "from" and "to" columns to be swapped in the first and second blocks of options. For example, if you have a CSV file with four columns "1, 2, 3, 4" and swap columns with positions "2" and "4", the output CSV will have columns in the order: "1, 4, 3, 2".As an alternative to positions, you can swap columns by specifying their headers (column names on the first row of data). If you enable this mode in the options, then you can enter the column names like "location" and "city", and the program will swap these two columns. If any of the specified columns have incomplete data (some fields are missing), you can choose to skip such data or fill the missing fields with empty values or custom values (specified in the options). Additionally, you can specify the symbol used for comments in the CSV data, such as "#" or "//". If you do not need the commented lines in the output, you can remove them by using the "Delete Comments" checkbox. You can also activate the checkbox "Delete Empty Lines" to get rid of empty lines that contain no visible information. Csv-abulous!',
  keywords: ['csv', 'swap', 'columns'],
  component: lazy(() => import('./index'))
});
