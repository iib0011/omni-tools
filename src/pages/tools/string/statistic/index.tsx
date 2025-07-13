import { Box } from '@mui/material';
import { useState } from 'react';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { textStatistics } from './service';
import ToolTextInput from '@components/input/ToolTextInput';
import { InitialValuesType } from './types';
import ToolContent from '@components/ToolContent';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  emptyLines: false,
  sentenceDelimiters: '',
  wordDelimiters: '',
  characterCount: false,
  wordCount: false
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Text Statistics without any Flag',
    description:
      'This example shows basic text statistics without any additional flags.',
    sampleText:
      'Giraffes have long necks that can be up to 6 feet (1.8 meters) long, but they only have 7 neck vertebrae, the same as humans.',
    sampleResult: `Text Statistics
==================
Characters: 125
Words: 26
Lines: 1
Sentences: 1
Paragraphs: 1`,
    sampleOptions: initialValues
  },
  {
    title: 'Text Statistics with Characters Frequency',
    description:
      'This example shows basic text statistics with characters frequency.',
    sampleText: `The Great Barrier Reef is the world's largest coral reef system, located off the coast of Australia. It consists of over 2,900 individual reefs and 900 islands. The reef is home to thousands of species of marine life, including fish, sea turtles, sharks, and dolphins. It is also a popular tourist destination, attracting millions of visitors every year. However, the reef is facing many threats, including climate change, pollution, and overfishing. Conservation efforts are being made to protect this unique and valuable ecosystem for future generations.`,
    sampleResult: `Text Statistics
==================
Characters: 556
Words: 87
Lines: 1
Sentences: 1
Paragraphs: 1

Characters Frequency
==================
0: 4 (0.72%)
2: 1 (0.18%)
9: 2 (0.36%)
␣: 85 (15.29%)
e: 51 (9.17%)
i: 40 (7.19%)
s: 40 (7.19%)
t: 39 (7.01%)
a: 37 (6.65%)
o: 34 (6.12%)
r: 33 (5.94%)
n: 29 (5.22%)
l: 21 (3.78%)
f: 20 (3.60%)
h: 15 (2.70%)
d: 15 (2.70%)
c: 14 (2.52%)
u: 14 (2.52%)
,: 11 (1.98%)
g: 10 (1.80%)
m: 8 (1.44%)
v: 8 (1.44%)
.: 6 (1.08%)
p: 6 (1.08%)
y: 5 (0.90%)
b: 3 (0.54%)
w: 2 (0.36%)
': 1 (0.18%)
k: 1 (0.18%)
q: 1 (0.18%)`,
    sampleOptions: {
      emptyLines: false,
      sentenceDelimiters: '',
      wordDelimiters: '',
      characterCount: true,
      wordCount: false
    }
  },
  {
    title: 'Text Statistics with Characters and Words Frequencies',
    description:
      'This example shows basic text statistics with characters and words frequencies.',
    sampleText: `The Great Barrier Reef is the world's largest coral reef system, located off the coast of Australia. It consists of over 2,900 individual reefs and 900 islands. The reef is home to thousands of species of marine life, including fish, sea turtles, sharks, and dolphins. It is also a popular tourist destination, attracting millions of visitors every year. However, the reef is facing many threats, including climate change, pollution, and overfishing. Conservation efforts are being made to protect this unique and valuable ecosystem for future generations.`,
    sampleResult: `Text Statistics
==================
Characters: 556
Words: 87
Lines: 1
Sentences: 1
Paragraphs: 1

Words Frequency
==================
2: 1 (1.15%)
900: 2 (2.30%)
the: 5 (5.75%)
of: 5 (5.75%)
reef: 4 (4.60%)
is: 4 (4.60%)
and: 4 (4.60%)
it: 2 (2.30%)
to: 2 (2.30%)
including: 2 (2.30%)
great: 1 (1.15%)
barrier: 1 (1.15%)
world's: 1 (1.15%)
largest: 1 (1.15%)
coral: 1 (1.15%)
system: 1 (1.15%)
located: 1 (1.15%)
off: 1 (1.15%)
coast: 1 (1.15%)
australia: 1 (1.15%)
consists: 1 (1.15%)
over: 1 (1.15%)
individual: 1 (1.15%)
reefs: 1 (1.15%)
islands: 1 (1.15%)
home: 1 (1.15%)
thousands: 1 (1.15%)
species: 1 (1.15%)
marine: 1 (1.15%)
life: 1 (1.15%)
fish: 1 (1.15%)
sea: 1 (1.15%)
turtles: 1 (1.15%)
sharks: 1 (1.15%)
dolphins: 1 (1.15%)
also: 1 (1.15%)
a: 1 (1.15%)
popular: 1 (1.15%)
tourist: 1 (1.15%)
destination: 1 (1.15%)
attracting: 1 (1.15%)
millions: 1 (1.15%)
visitors: 1 (1.15%)
every: 1 (1.15%)
year: 1 (1.15%)
however: 1 (1.15%)
facing: 1 (1.15%)
many: 1 (1.15%)
threats: 1 (1.15%)
climate: 1 (1.15%)
change: 1 (1.15%)
pollution: 1 (1.15%)
overfishing: 1 (1.15%)
conservation: 1 (1.15%)
efforts: 1 (1.15%)
are: 1 (1.15%)
being: 1 (1.15%)
made: 1 (1.15%)
protect: 1 (1.15%)
this: 1 (1.15%)
unique: 1 (1.15%)
valuable: 1 (1.15%)
ecosystem: 1 (1.15%)
for: 1 (1.15%)
future: 1 (1.15%)
generations: 1 (1.15%)

Characters Frequency
==================
0: 4 (0.72%)
2: 1 (0.18%)
9: 2 (0.36%)
␣: 85 (15.29%)
e: 51 (9.17%)
i: 40 (7.19%)
s: 40 (7.19%)
t: 39 (7.01%)
a: 37 (6.65%)
o: 34 (6.12%)
r: 33 (5.94%)
n: 29 (5.22%)
l: 21 (3.78%)
f: 20 (3.60%)
h: 15 (2.70%)
d: 15 (2.70%)
c: 14 (2.52%)
u: 14 (2.52%)
,: 11 (1.98%)
g: 10 (1.80%)
m: 8 (1.44%)
v: 8 (1.44%)
.: 6 (1.08%)
p: 6 (1.08%)
y: 5 (0.90%)
b: 3 (0.54%)
w: 2 (0.36%)
': 1 (0.18%)
k: 1 (0.18%)
q: 1 (0.18%)`,
    sampleOptions: {
      emptyLines: false,
      sentenceDelimiters: '',
      wordDelimiters: '',
      characterCount: true,
      wordCount: true
    }
  }
];

export default function Truncate({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  function compute(initialValues: InitialValuesType, input: string) {
    setResult(textStatistics(input, initialValues));
  }

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('string.statistic.delimitersOptions'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.sentenceDelimiters}
            onOwnChange={(val) => updateField('sentenceDelimiters', val)}
            placeholder={t('string.statistic.sentenceDelimitersPlaceholder')}
            description={t('string.statistic.sentenceDelimitersDescription')}
          />
          <TextFieldWithDesc
            value={values.wordDelimiters}
            onOwnChange={(val) => updateField('wordDelimiters', val)}
            placeholder={t('string.statistic.wordDelimitersPlaceholder')}
            description={t('string.statistic.wordDelimitersDescription')}
          />
        </Box>
      )
    },
    {
      title: t('string.statistic.statisticsOptions'),
      component: (
        <Box>
          <CheckboxWithDesc
            checked={values.wordCount}
            onChange={(value) => updateField('wordCount', value)}
            title={t('string.statistic.wordFrequencyAnalysis')}
            description={t('string.statistic.wordFrequencyAnalysisDescription')}
          />
          <CheckboxWithDesc
            checked={values.characterCount}
            onChange={(value) => updateField('characterCount', value)}
            title={t('string.statistic.characterFrequencyAnalysis')}
            description={t(
              'string.statistic.characterFrequencyAnalysisDescription'
            )}
          />
          <CheckboxWithDesc
            checked={values.emptyLines}
            onChange={(value) => updateField('emptyLines', value)}
            title={t('string.statistic.includeEmptyLines')}
            description={t('string.statistic.includeEmptyLinesDescription')}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      input={input}
      setInput={setInput}
      inputComponent={
        <ToolTextInput
          title={t('string.statistic.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('string.statistic.resultTitle')}
          value={result}
        />
      }
      toolInfo={{
        title: t('string.statistic.toolInfo.title', { title }),
        description: longDescription
      }}
      exampleCards={exampleCards}
    />
  );
}
