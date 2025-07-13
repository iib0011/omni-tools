import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import SimpleRadio from '@components/options/SimpleRadio';
import { truncateClockTime } from './service';
import { useTranslation } from 'react-i18next';

const initialValues = {
  onlySecond: true,
  zeroPrint: false,
  zeroPadding: true
};
type InitialValuesType = typeof initialValues;
const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Truncate Seconds',
    description:
      'In this example, we get rid of the seconds part from several timer values. We select the "Truncate Only Seconds" mode and get a list of timer values consisting only of hours and minutes in format "hh:mm" (the ":ss" part is removed).',
    sampleText: `01:28:06
07:39:56
02:12:41
10:10:38`,
    sampleResult: `01:28
07:39
02:12
10:10`,
    sampleOptions: { onlySecond: true, zeroPrint: false, zeroPadding: true }
  },
  {
    title: 'Truncate Minutes and Seconds',
    description:
      'This example truncates five clock times to an hour. It drops the minutes and seconds parts and only outputs the hours with zero padding.',
    sampleText: `04:42:03
07:09:59
11:29:16
21:30:45
13:03:09`,
    sampleResult: `04
07
11
21
13`,
    sampleOptions: { onlySecond: false, zeroPrint: false, zeroPadding: true }
  },
  {
    title: 'Set Seconds to Zero',
    description:
      'In this example, we set the seconds part of each time to zero by first truncating the time to minutes and then appending a zero at the end in place of the truncated seconds. To do this, we switch on the seconds-truncation mode and activate the option to print-zero-time-parts. We also turn off the padding option and get the output time in format "h:m:s", where the seconds are always zero so the final format is "h:m:0".',
    sampleText: `17:25:55
10:16:07
12:02:09
06:05:11`,
    sampleResult: `17:25:0
10:16:0
12:2:0
6:5:0`,
    sampleOptions: { onlySecond: true, zeroPrint: true, zeroPadding: true }
  }
];

export default function TruncateClockTime({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('time');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: typeof initialValues, input: string) => {
    setResult(
      truncateClockTime(
        input,
        optionsValues.onlySecond,
        optionsValues.zeroPrint,
        optionsValues.zeroPadding
      )
    );
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('truncateClockTime.truncationSide'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('onlySecond', true)}
            checked={values.onlySecond}
            title={t('truncateClockTime.truncateOnlySeconds')}
            description={t(
              'time:truncateClockTime.truncateOnlySecondsDescription'
            )}
          />
          <SimpleRadio
            onClick={() => updateField('onlySecond', false)}
            checked={!values.onlySecond}
            title={t('truncateClockTime.truncateMinutesAndSeconds')}
            description={t(
              'time:truncateClockTime.truncateMinutesAndSecondsDescription'
            )}
          />
        </Box>
      )
    },
    {
      title: t('truncateClockTime.printDroppedComponents'),
      component: (
        <Box>
          <CheckboxWithDesc
            onChange={(val) => updateField('zeroPrint', val)}
            checked={values.zeroPrint}
            title={t('truncateClockTime.zeroPrintTruncatedParts')}
            description={t('truncateClockTime.zeroPrintDescription')}
          />
        </Box>
      )
    },
    {
      title: t('truncateClockTime.timePadding'),
      component: (
        <Box>
          <CheckboxWithDesc
            onChange={(val) => updateField('zeroPadding', val)}
            checked={values.zeroPadding}
            title={t('truncateClockTime.useZeroPadding')}
            description={t('truncateClockTime.zeroPaddingDescription')}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={<ToolTextInput value={input} onChange={setInput} />}
      resultComponent={<ToolTextResult value={result} />}
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('truncateClockTime.toolInfo.title', { title }),
        description: longDescription
      }}
      exampleCards={exampleCards}
    />
  );
}
