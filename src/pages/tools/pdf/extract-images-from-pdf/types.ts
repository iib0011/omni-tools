// PDF Worker Extracts This Object From Images in Files
export interface PdfImageObject {
  width: number;
  height: number;
  bitmap: ImageBitmap;
  ref: string;
}

// Used For Easier Iterations Prior to Drawing on Canvas
export interface PreProcessImageObject {
  img: PdfImageObject;
  pageNum: number;
  imageNum: number;
}
