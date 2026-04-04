import { CardExampleType } from '@components/examples/ToolExamples';
import InitialValuesType from './types';

export const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Basic Date to Unix',
    description:
      'In this example, a plain human-readable timeframe is converted into a Unix timestamp. The UTC offset is treated as +00:00. ',
    sampleText: `1990-03-17 14:23:00
2012-12-21 00:00:00`,
    sampleResult: `637674180
1356048000`,
    sampleOptions: { useLocalTime: false }
  },
  {
    title: 'With UTC Offset',
    description:
      'In this example, the UTC offset is provided after stating the timeframe with a space.',
    sampleText: `1985-06-15 12:00:00 +00:00
2025-04-04 10:00:00 +08:00`,
    sampleResult: `487598400
1743724800`,
    sampleOptions: { useLocalTime: false }
  },
  {
    title: 'Use Local Time',
    description:
      "This example uses your browser's timezone. Any suffix provided as the UTC offset is ignored.  In this case we assume the timezone of the user to be UTC+6.",
    sampleText: `2025-04-04 07:30:00`,
    sampleResult: `1743744600`,
    sampleOptions: { useLocalTime: true }
  }
];
