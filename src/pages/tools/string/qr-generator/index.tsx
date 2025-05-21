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
          <div ref={qrRef} className="p-4 bg-white rounded shadow inline-block">
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
  );
}
