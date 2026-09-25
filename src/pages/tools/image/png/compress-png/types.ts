export interface InitialValuesType {
  /**
   * 1-100. Drives the size of the color palette the picture is reduced to:
   * 100 keeps 256 colors, lower values keep fewer colors and compress harder.
   */
  quality: number;
  /**
   * Spread the quantization error over neighboring pixels (Floyd-Steinberg).
   * Hides banding in gradients at the cost of a slightly bigger file.
   */
  dithering: boolean;
  /**
   * Optional size budget in kilobytes. When set, the palette is shrunk
   * step by step until the output fits. 0 disables the budget.
   */
  maxOutputSizeInKB: number;
}
