import { Box, Grid, Stack, Typography } from '@mui/material';
import ExampleCard, { ExampleCardProps } from './ExampleCard';
import React from 'react';
import { GetGroupsType } from '@components/options/ToolOptions';
import { useFormikContext } from 'formik';
import i18n from 'i18n/i18n';

export type CardExampleType<T> = Omit<
  ExampleCardProps<T>,
  'getGroups' | 'changeInputResult'
>;

export interface ExampleProps<T> {
  title: string;
  subtitle?: string;
  exampleCards: CardExampleType<T>[];
  getGroups: GetGroupsType<T> | null;
  setInput?: React.Dispatch<React.SetStateAction<any>>;
}

export default function ToolExamples<T>({
  title,
  subtitle,
  exampleCards,
  getGroups,
  setInput
}: ExampleProps<T>) {
  const { setValues } = useFormikContext<T>();

  function changeInputResult(newInput: string | undefined, newOptions: T) {
    setInput?.(newInput);
    setValues(newOptions);
    const toolsElement = document.getElementById('tool');
    if (toolsElement) {
      toolsElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <Box id={'examples'} mt={4}>
      <Box mt={4} display="flex" gap={1} alignItems="center">
        <Typography mb={2} fontSize={30} color={'primary'}>
          {title + ' ' + i18n.t('examples')}
        </Typography>
        <Typography mb={2} fontSize={30} color={'secondary'}>
          {subtitle ?? i18n.t('clickToTry')}
        </Typography>
      </Box>

      <Stack direction={'row'} alignItems={'center'} spacing={2}>
        <Grid container spacing={2}>
          {exampleCards.map((card, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <ExampleCard
                title={card.title}
                description={card.description}
                sampleText={card.sampleText}
                sampleResult={card.sampleResult}
                sampleOptions={card.sampleOptions}
                getGroups={getGroups}
                changeInputResult={changeInputResult}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}
