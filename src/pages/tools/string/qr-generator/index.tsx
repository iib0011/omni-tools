'use client';

import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { ToolComponentProps } from '@tools/defineTool';
import ToolContent from '@components/ToolContent';
import { generateQRCodeSVG } from './service';

const initialValues = {};

export default function QRGeneratorTool({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const computeExternal = () => {
    setResult(generateQRCodeSVG(input));
  };

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={() => []} // QR은 옵션 없이 단순 입력 → 변환
      compute={computeExternal}
      input={input}
      setInput={setInput}
      inputComponent={
        <ToolTextInput
          title="QR에 넣을 텍스트"
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult
          title="QR 코드 결과 (SVG)"
          value={result}
          type="html" // 결과가 SVG 문자열이라면 이렇게 설정
        />
      }
      toolInfo={{
        title: 'QR 코드 생성기란?',
        description: longDescription
      }}
      exampleCards={[]} // 예시 생략 가능
    />
  );
}
