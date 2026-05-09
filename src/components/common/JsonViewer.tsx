import { useState } from 'react';

type JsonViewerProps = {
  data: unknown;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const JsonViewer = ({ data }: JsonViewerProps) => {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
      <JsonNode value={data} level={0} />
    </div>
  );
};

type JsonNodeProps = {
  value: unknown;
  level: number;
};

const JsonNode = ({ value, level }: JsonNodeProps) => {
  const [expanded, setExpanded] = useState(true);

  if (!isObject(value)) {
    return <span>{JSON.stringify(value)}</span>;
  }

  const isArray = Array.isArray(value);
  const entries = isArray
    ? (value as unknown[]).map((v, i) => [i, v] as const)
    : Object.entries(value);

  return (
    <div style={{ paddingLeft: level * 16 }}>
      <span
        style={{
          cursor: 'pointer',
          fontWeight: 600,
          userSelect: 'none'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '▼' : '▶'} {isArray ? '[' : '{'}
      </span>

      {expanded && (
        <div>
          {entries.map(([key, val]) => (
            <div key={String(key)} style={{ paddingLeft: 16 }}>
              {!isArray && (
                <span style={{ color: '#0ea5e9' }}>{String(key)}: </span>
              )}
              <JsonNode value={val} level={level + 1} />
            </div>
          ))}
          <div>{isArray ? ']' : '}'}</div>
        </div>
      )}
    </div>
  );
};

export default JsonViewer;
