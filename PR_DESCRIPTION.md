# Add Meme Creator Tool

## Description
This PR adds a new meme creator tool under the `image-generic` category that allows users to add customizable text to their images.

## Features
- ✅ Single text input field for meme text
- ✅ Horizontal and vertical positioning controls (0-100%)
- ✅ Customizable font size (10-200px)
- ✅ Text color and stroke/outline color customization
- ✅ Adjustable stroke width (0-10px)
- ✅ All processing happens client-side in the browser (images never leave the device)
- ✅ Real-time preview with debounced updates

## Changes
- Added new `meme-creator` tool in `src/pages/tools/image/generic/meme-creator/`
- Updated `src/pages/tools/image/generic/index.ts` to include the new tool
- Added English translations in `public/locales/en/image.json`

## Testing
- [x] Tool appears in the image-generic category
- [x] Image upload works correctly
- [x] Text positioning works (horizontal and vertical)
- [x] Text styling options work as expected
- [x] Result image is generated correctly
- [x] No linting errors

## Related Issue
Fixes #271

## Screenshots
(Add screenshots of the tool in action if available)

