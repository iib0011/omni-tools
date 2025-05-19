'use client';

import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolContent from '@components/ToolContent';
import QRCode from 'react-qr-code';
import type { ToolComponentProps } from '@tools/defineTool';

const initialValues = {};

export default function QRGeneratorTool({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');

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
        />
      }
      resultComponent={
        <div className="p-4 bg-white rounded shadow inline-block">
          <QRCode value={input || 'https://example.com'} size={256} />
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
