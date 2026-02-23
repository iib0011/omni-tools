import { useState } from 'react';

function convertInput(input: string) {
  const trimmed = input.trim();

  // Case 1: Discord timestamp → normal date
  const match = trimmed.match(/^<t:(\d+):[A-Za-z]>$/);
  if (match) {
    const unix = Number(match[1]);
    const date = new Date(unix * 1000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().replace('T', ' ').slice(0, 16);
    }
  }

  // Case 2: normal date → Discord timestamp
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return 'Invalid date/time';
  const unix = Math.floor(date.getTime() / 1000);
  return `<t:${unix}:F>`;
}

export default function DiscordTimestamp() {
  const [value, setValue] = useState('');
  const [copied, setCopied] = useState(false);

  const result = value ? convertInput(value) : '';

  const handleCopy = async () => {
    if (!result || result === 'Invalid date/time') return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  return (
    <div className="flex gap-3 items-stretch">
      <textarea
        placeholder="Enter date like: 2026-02-23 18:30"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 min-h-[140px] p-3 rounded-lg bg-neutral-900 text-white border border-neutral-700 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex-1 relative flex">
        <textarea
          readOnly
          value={value ? result : 'Enter a date to generate timestamp'}
          className="flex-1 w-full min-h-[140px] p-3 pr-12 pt-10 rounded-lg bg-neutral-900 text-white border border-neutral-700 focus:outline-none"
        />

        <button
          onClick={handleCopy}
          disabled={!result || result === 'Invalid date/time'}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-md bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-neutral-200 disabled:opacity-40"
          title="Copy to clipboard"
        >
          {copied ? '✓' : '📋'}
        </button>
        {copied && (
          <span className="absolute top-3 right-12 text-xs text-green-400">
            Copied
          </span>
        )}
      </div>
    </div>
  );
}
