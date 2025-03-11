import { InitialValuesType, truncationSideType } from './initialValues';

export function truncateText(options: InitialValuesType, text: string) {
  const { truncationSide, maxLength, lineByLine, addIndicator, indicator } =
    options;

  const parsedMaxLength = parseInt(maxLength) || 0;

  if (parsedMaxLength < 0) {
    throw new Error('Length value cannot be negative');
  }

  const truncate =
    truncationSide === 'right' ? truncateFromRight : truncateFromLeft;

  return lineByLine
    ? text
        .split('\n')
        .map((line) =>
          truncate(
            line,
            parsedMaxLength,
            addIndicator,
            indicator,
            truncationSide
          )
        )
        .join('\n')
    : truncate(text, parsedMaxLength, addIndicator, indicator, truncationSide);
}

function truncateFromRight(
  text: string,
  maxLength: number,
  addIndicator: boolean,
  indicator: string,
  truncationSide: truncationSideType
) {
  const result = text.slice(0, maxLength);

  return addIndicator
    ? addIndicatorToText(result, indicator, truncationSide)
    : result;
}

function truncateFromLeft(
  text: string,
  maxLength: number,
  addIndicator: boolean,
  indicator: string,
  truncationSide: truncationSideType
) {
  const result = text.slice(-maxLength);

  return addIndicator
    ? addIndicatorToText(result, indicator, truncationSide)
    : result;
}

function addIndicatorToText(
  text: string,
  indicator: string,
  truncationSide: truncationSideType
) {
  if (indicator.length > text.length && text.length) {
    throw new Error('Indicator length is greater than truncation length');
  }

  if (!text.length) {
    return '';
  }

  switch (truncationSide) {
    case 'right': {
      const result = text.slice(0, text.length - indicator.length);
      return `${result}${indicator}`;
    }

    case 'left': {
      const result = text.slice(-text.length + indicator.length);
      return `${indicator}${result}`;
    }
  }
}
