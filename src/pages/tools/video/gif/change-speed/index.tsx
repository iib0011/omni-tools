import { Box } from '@mui/material';
import React, { useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from 'components/options/TextFieldWithDesc';
import Typography from '@mui/material/Typography';
import { FrameOptions, GifReader, GifWriter } from 'omggif';
import { gifBinaryToFile } from '@utils/gif';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolVideoInput from '@components/input/ToolVideoInput';
import ToolImageInput from '@components/input/ToolImageInput';

const initialValues = {
  newSpeed: 200
};
const validationSchema = Yup.object({
  // splitSeparator: Yup.string().required('The separator is required')
});
export default function ChangeSpeed({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const compute = (optionsValues: typeof initialValues, input: File | null) => {
    if (!input) return;
    const { newSpeed } = optionsValues;

    const processImage = async (file: File, newSpeed: number) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = async () => {
        const arrayBuffer = reader.result;

        if (arrayBuffer instanceof ArrayBuffer) {
          const intArray = new Uint8Array(arrayBuffer);

          const reader = new GifReader(intArray as Buffer);
          const info = reader.frameInfo(0);
          const imageDataArr: ImageData[] = new Array(reader.numFrames())
            .fill(0)
            .map((_, k) => {
              const image = new ImageData(info.width, info.height);

              reader.decodeAndBlitFrameRGBA(k, image.data);

              return image;
            });
          const gif = new GifWriter(
            [],
            imageDataArr[0].width,
            imageDataArr[0].height,
            { loop: 20 }
          );

          imageDataArr.forEach((imageData) => {
            const palette = [];
            const pixels = new Uint8Array(imageData.width * imageData.height);

            const { data } = imageData;
            for (let j = 0, k = 0, jl = data.length; j < jl; j += 4, k++) {
              const r = Math.floor(data[j] * 0.1) * 10;
              const g = Math.floor(data[j + 1] * 0.1) * 10;
              const b = Math.floor(data[j + 2] * 0.1) * 10;
              const color = (r << 16) | (g << 8) | (b << 0);

              const index = palette.indexOf(color);

              if (index === -1) {
                pixels[k] = palette.length;
                palette.push(color);
              } else {
                pixels[k] = index;
              }
            }

            // Force palette to be power of 2

            let powof2 = 1;
            while (powof2 < palette.length) powof2 <<= 1;
            palette.length = powof2;

            const delay = newSpeed / 10; // Delay in hundredths of a sec (100 = 1s)
            const options: FrameOptions = {
              palette,
              delay
            };
            gif.addFrame(
              0,
              0,
              imageData.width,
              imageData.height,
              // @ts-ignore
              pixels,
              options
            );
          });
          const newFile = gifBinaryToFile(gif.getOutputBuffer(), file.name);

          setResult(newFile);
        }
      };
    };

    processImage(input, newSpeed);
  };
  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/gif']}
          title={'Input GIF'}
        />
      }
      resultComponent={
        <ToolFileResult
          title={'Output GIF with new speed'}
          value={result}
          extension={'gif'}
        />
      }
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: 'New GIF speed',
          component: (
            <Box>
              <TextFieldWithDesc
                value={values.newSpeed}
                onOwnChange={(val) => updateField('newSpeed', Number(val))}
                description={'Default new GIF speed.'}
                InputProps={{ endAdornment: <Typography>ms</Typography> }}
                type={'number'}
              />
            </Box>
          )
        }
      ]}
      compute={compute}
      setInput={setInput}
    />
  );
}
