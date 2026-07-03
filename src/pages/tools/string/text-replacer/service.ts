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

function hasNestedQuantifiers(pattern: string): boolean {
  // Detect patterns like (a+)+, (b*)*, (c+d+)+ that cause catastrophic backtracking
  let depth = 0;
  let lastGroupHadQuantifier = false;
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '(') depth++;
    else if (pattern[i] === ')') {
      const nextChar = pattern[i + 1];
      if (nextChar === '+' || nextChar === '*' || nextChar === '?') {
        if (lastGroupHadQuantifier && depth > 0) return true;
        lastGroupHadQuantifier = true;
      } else {
        lastGroupHadQuantifier = false;
      }
      depth = Math.max(0, depth - 1);
    }
  }
  return false;
}

function replaceTextWithRegexp(
  text: string,
  searchRegexp: string,
  replaceValue: string
) {
  try {
    const match = searchRegexp.match(/^\/(.*)\/([a-z]*)$/i);

    let pattern: string;
    let flags: string;

    if (match) {
      pattern = match[1];
      flags = match[2];
    } else {
      pattern = searchRegexp;
      flags = 'g';
    }

    if (hasNestedQuantifiers(pattern)) {
      return text;
    }

    return text.replace(new RegExp(pattern, flags), replaceValue);
  } catch (err) {
    return text;
  }
}
