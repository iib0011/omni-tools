'use client';

import React, { useRef, useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolContent from '@components/ToolContent';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import type { ToolComponentProps } from '@tools/defineTool';

const initialValues = {};

export default function QRGeneratorTool({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!qrRef.current) return;
    try {
      const dataUrl = await toPng(qrRef.current);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'qr-code.png';
      a.click();
    } catch (err) {
      console.error('QR 다운로드 실패:', err);
    }
  };

  return (
    <>
      <ToolContent
        title={title}
        initialValues={initialValues}
        getGroups={() => []}
        compute={() => {}}
        input={input}
        setInput={setInput}
        inputComponent={
          <ToolTextInput
            title="QR 코드에 들어갈 텍스트"
            value={input}
            onChange={setInput}
            hideFileImport
          />
        }
        resultComponent={
          <div className="flex flex-col items-center gap-4">
            <div
              ref={qrRef}
              className="p-4 bg-white rounded shadow inline-block"
            >
              <QRCode value={input || 'https://example.com'} size={256} />
            </div>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              QR 코드 다운로드
            </button>
          </div>
        }
        toolInfo={{
          title: 'QR 코드 생성기란?',
          description: longDescription
        }}
        exampleCards={[]}
      />

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-center mb-6">
          QR 코드 예시 미리보기
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[
            {
              title: 'NAVER',
              text: 'https://naver.com'
            },
            {
              title: 'ChungBuk University',
              text: 'https://lms.chungbuk.ac.kr/login/index.php'
            },
            {
              title: 'EMAIL',
              text: 'sunju@example.com'
            }
          ].map((example, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow p-6 flex flex-col items-center justify-center text-center"
            >
              <h3 className="text-lg font-bold mb-3">{example.title}</h3>
              <div className="w-full text-sm bg-gray-100 p-3 rounded mb-4 break-words">
                {example.text}
              </div>
              <QRCode value={example.text} size={128} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
