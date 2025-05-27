import { InitialValuesType } from './types';
import { TopItemsList } from '../../list/find-most-popular/service';

function countLines(text: string, options: InitialValuesType): number {
  const numberofLines = options.emptyLines
    ? text.split('\n').length
    : text.split('\n').filter((line) => line.trim() !== '').length;

  return numberofLines;
}

function countCharacters(text: string): number {
  return text.length;
}

function countSentences(text: string, options: InitialValuesType): number {
  const sentenceDelimiters = options.sentenceDelimiters
    ? options.sentenceDelimiters.split(',').map((s) => s.trim())
    : ['.', '!', '?', '...'];

  const regex = new RegExp(`[${sentenceDelimiters.join('')}]`, 'g');
  const sentences = text
    .split(regex)
    .filter((sentence) => sentence.trim() !== '');
  return sentences.length;
}

function wordsStats(
  text: string,
  options: InitialValuesType
): [number, string] {
  const defaultDelimiters = `\\s.,;:!?"“”«»()…`;
  const wordDelimiters = options.wordDelimiters || defaultDelimiters;
  const regex = new RegExp(`[${wordDelimiters}]`, 'gu');
  const words = text.split(regex).filter((word) => word.trim() !== '');

  const wordsFrequency = TopItemsList(
    'regex',
    'count',
    'percentage',
    '',
    words,
    false,
    true,
    false
  );

  return options.wordCount
    ? [words.length, wordsFrequency]
    : [words.length, ''];
}

function countParagraphs(text: string): number {
  return text
    .split(/\r?\n\s*\r?\n/)
    .filter((paragraph) => paragraph.trim() !== '').length;
}

function charactersStatistic(text: string, options: InitialValuesType): string {
  if (!options.characterCount) return '';
  const result = TopItemsList(
    'symbol',
    'count',
    'percentage',
    '',
    text,
    true,
    true,
    false
  );
  return result;
}

export function textStatistics(
  input: string,
  options: InitialValuesType
): string {
  if (!input) return '';

  const numberofLines = countLines(input, options);
  const numberofCharacters = countCharacters(input);
  const numberofSentences = countSentences(input, options);
  const [numberofWords, wordsFrequency] = wordsStats(input, options);
  const numberofParagraphs = countParagraphs(input);
  const characterStats = charactersStatistic(input, options);

  const stats = `Text Statistics
==================
Characters: ${numberofCharacters}
Words: ${numberofWords}
Lines: ${numberofLines}
Sentences: ${numberofSentences}
Paragraphs: ${numberofParagraphs}`;

  const charStats = `Characters Frequency
==================
${characterStats}`;

  const wordStatsOutput = `Words Frequency
==================
${wordsFrequency}`;

  let result = stats;
  if (options.wordCount) result += `\n\n${wordStatsOutput}`;
  if (options.characterCount) result += `\n\n${charStats}`;

  return result;
}
