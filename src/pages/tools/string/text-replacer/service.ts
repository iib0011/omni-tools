import { InitialValuesType } from './initialValues';

function isFieldsEmpty(textField: string, searchField: string) {
  return !textField.trim() || !searchField.trim();
}

export function replaceText(options: InitialValuesType, text: string) {
  const { searchValue, searchRegexp, replaceValue, mode } = options;

  switch (mode) {
    case 'text':
      if (isFieldsEmpty(text, searchValue)) return text;
      return text.replaceAll(searchValue, replaceValue);
    case 'regexp':
      if (isFieldsEmpty(text, searchRegexp)) return text;
      return replaceTextWithRegexp(text, searchRegexp, replaceValue);
  }
}

function replaceTextWithRegexp(
  text: string,
  searchRegexp: string,
  replaceValue: string
) {
  try {
    const match = searchRegexp.match(/^\/(.*)\/([a-z]*)$/i);

    if (match) {
      // Input is in /pattern/flags format
      const [, pattern, flags] = match;
      return text.replace(new RegExp(pattern, flags), replaceValue);
    } else {
      // Input is a raw pattern - don't escape it
      return text.replace(new RegExp(searchRegexp, 'g'), replaceValue);
    }
  } catch (err) {
    // console.error('Invalid regular expression:', err);
    return text;
  }
}
