export type InitialValuesType = {
  showUnicodeCodes: boolean;
  highlightRTL: boolean;
  showInvisibleChars: boolean;
  includeZeroWidthChars: boolean;
};

export interface HiddenCharacter {
  char: string;
  unicode: string;
  name: string;
  category: string;
  position: number;
  isRTL: boolean;
  isInvisible: boolean;
  isZeroWidth: boolean;
}

export interface AnalysisResult {
  originalText: string;
  hiddenCharacters: HiddenCharacter[];
  hasRTLOverride: boolean;
  hasInvisibleChars: boolean;
  hasZeroWidthChars: boolean;
  totalHiddenChars: number;
}
