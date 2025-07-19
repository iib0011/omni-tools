import { InitialValuesType, HiddenCharacter, AnalysisResult } from './types';

// RTL Override characters
const RTL_CHARS = [
  { char: '\u202E', name: 'Right-to-Left Override', unicode: 'U+202E' },
  { char: '\u202D', name: 'Left-to-Right Override', unicode: 'U+202D' },
  { char: '\u202B', name: 'Right-to-Left Embedding', unicode: 'U+202B' },
  { char: '\u202A', name: 'Left-to-Right Embedding', unicode: 'U+202A' },
  { char: '\u200F', name: 'Right-to-Left Mark', unicode: 'U+200F' },
  { char: '\u200E', name: 'Left-to-Right Mark', unicode: 'U+200E' }
];

// Invisible characters
const INVISIBLE_CHARS = [
  { char: '\u200B', name: 'Zero Width Space', unicode: 'U+200B' },
  { char: '\u200C', name: 'Zero Width Non-Joiner', unicode: 'U+200C' },
  { char: '\u200D', name: 'Zero Width Joiner', unicode: 'U+200D' },
  { char: '\u2060', name: 'Word Joiner', unicode: 'U+2060' },
  { char: '\uFEFF', name: 'Zero Width No-Break Space', unicode: 'U+FEFF' },
  { char: '\u00A0', name: 'Non-Breaking Space', unicode: 'U+00A0' },
  { char: '\u2000', name: 'En Quad', unicode: 'U+2000' },
  { char: '\u2001', name: 'Em Quad', unicode: 'U+2001' },
  { char: '\u2002', name: 'En Space', unicode: 'U+2002' },
  { char: '\u2003', name: 'Em Space', unicode: 'U+2003' },
  { char: '\u2004', name: 'Three-Per-Em Space', unicode: 'U+2004' },
  { char: '\u2005', name: 'Four-Per-Em Space', unicode: 'U+2005' },
  { char: '\u2006', name: 'Six-Per-Em Space', unicode: 'U+2006' },
  { char: '\u2007', name: 'Figure Space', unicode: 'U+2007' },
  { char: '\u2008', name: 'Punctuation Space', unicode: 'U+2008' },
  { char: '\u2009', name: 'Thin Space', unicode: 'U+2009' },
  { char: '\u200A', name: 'Hair Space', unicode: 'U+200A' }
];

function getCharacterInfo(char: string, position: number): HiddenCharacter {
  const unicode = `U+${char
    .charCodeAt(0)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0')}`;

  // Check if it's an RTL character
  const rtlChar = RTL_CHARS.find((c) => c.char === char);
  if (rtlChar) {
    return {
      char,
      unicode: rtlChar.unicode,
      name: rtlChar.name,
      category: 'RTL Override',
      position,
      isRTL: true,
      isInvisible: false,
      isZeroWidth: false
    };
  }

  // Check if it's an invisible character
  const invisibleChar = INVISIBLE_CHARS.find((c) => c.char === char);
  if (invisibleChar) {
    return {
      char,
      unicode: invisibleChar.unicode,
      name: invisibleChar.name,
      category: 'Invisible Character',
      position,
      isRTL: false,
      isInvisible: true,
      isZeroWidth:
        char === '\u200B' ||
        char === '\u200C' ||
        char === '\u200D' ||
        char === '\u2060' ||
        char === '\uFEFF'
    };
  }

  // Check for other control characters
  if (char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127) {
    return {
      char,
      unicode,
      name: `Control Character (${char.charCodeAt(0)})`,
      category: 'Control Character',
      position,
      isRTL: false,
      isInvisible: true,
      isZeroWidth: false
    };
  }

  return {
    char,
    unicode,
    name: 'Regular Character',
    category: 'Regular',
    position,
    isRTL: false,
    isInvisible: false,
    isZeroWidth: false
  };
}

export function analyzeHiddenCharacters(
  text: string,
  options: InitialValuesType
): AnalysisResult {
  const hiddenCharacters: HiddenCharacter[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const charInfo = getCharacterInfo(char, i);

    // Filter based on options
    if (options.highlightRTL && charInfo.isRTL) {
      hiddenCharacters.push(charInfo);
    } else if (options.showInvisibleChars && charInfo.isInvisible) {
      hiddenCharacters.push(charInfo);
    } else if (options.includeZeroWidthChars && charInfo.isZeroWidth) {
      hiddenCharacters.push(charInfo);
    }
  }

  const hasRTLOverride = hiddenCharacters.some((c) => c.isRTL);
  const hasInvisibleChars = hiddenCharacters.some((c) => c.isInvisible);
  const hasZeroWidthChars = hiddenCharacters.some((c) => c.isZeroWidth);

  return {
    originalText: text,
    hiddenCharacters,
    hasRTLOverride,
    hasInvisibleChars,
    hasZeroWidthChars,
    totalHiddenChars: hiddenCharacters.length
  };
}

export function main(input: string, options: InitialValuesType): string {
  const result = analyzeHiddenCharacters(input, options);

  if (result.totalHiddenChars === 0) {
    return 'No hidden characters detected in the text.';
  }

  let output = `Found ${result.totalHiddenChars} hidden character(s):\n\n`;

  result.hiddenCharacters.forEach((char) => {
    output += `Position ${char.position}: ${char.name} (${char.unicode})\n`;
    if (options.showUnicodeCodes) {
      output += `  Unicode: ${char.unicode}\n`;
    }
    output += `  Category: ${char.category}\n`;
    if (char.isRTL) output += `  ⚠️  RTL Override Character\n`;
    if (char.isInvisible) output += `  👁️  Invisible Character\n`;
    if (char.isZeroWidth) output += `  📏  Zero Width Character\n`;
    output += '\n';
  });

  if (result.hasRTLOverride) {
    output +=
      '⚠️  WARNING: RTL Override characters detected! This could be used in attacks.\n';
  }

  return output;
}
