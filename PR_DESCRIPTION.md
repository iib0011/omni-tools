# Add Meme Creator Tool

## Description
This PR adds a new meme creator tool under the `image-generic` category that allows users to add customizable text to their images. All processing happens client-side in the browser, ensuring user privacy as images never leave their device.

## Features
- ✅ Single text input field for meme text
- ✅ Horizontal and vertical positioning controls (0-100%)
- ✅ Customizable font size (10-200px)
- ✅ Text color and stroke/outline color customization
- ✅ Adjustable stroke width (0-10px)
- ✅ All processing happens client-side in the browser (images never leave the device)
- ✅ Real-time preview with debounced updates
- ✅ Export as PNG format

## Changes
- Added new `meme-creator` tool in `src/pages/tools/image/generic/meme-creator/`
  - `meta.ts` - Tool metadata and registration
  - `index.tsx` - Main component with canvas-based text overlay
- Updated `src/pages/tools/image/generic/index.ts` to include the new tool
- Added English translations in `public/locales/en/image.json`

## Technical Details
- Uses HTML5 Canvas API for text overlay rendering
- Impact font (uppercase) for classic meme-style text
- Text has stroke/outline for better readability on any background
- Debounced computation for performance optimization
- Form validation using Yup schema

## User Experience
- Simple and intuitive interface
- Upload image from local device
- Add text and position it anywhere on the image
- Customize text appearance (size, colors, stroke)
- Download the meme as a PNG file

## Testing
- [x] Tool appears in the image-generic category
- [x] Image upload works correctly
- [x] Text positioning works (horizontal and vertical)
- [x] Text styling options work as expected
- [x] Result image is generated correctly
- [x] No linting errors
- [x] All processing happens client-side

## Screenshots
(Add screenshots of the tool in action if available)

## Related Issue
Fixes #271
