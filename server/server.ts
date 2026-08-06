import { createReadStream, existsSync } from 'fs';
import { stat } from 'fs/promises';
import { createServer } from 'http';
import path from 'path';
import { handleMarkdownPdfRequest } from './markdown-to-pdf/http';

const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');
const port = Number(process.env.PORT || 3000);

const mimeTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

async function resolveAssetPath(urlPath: string): Promise<string> {
  const candidate = path.normalize(
    path.join(distDir, decodeURIComponent(urlPath.replace(/^\/+/u, '')))
  );

  if (!candidate.startsWith(distDir)) {
    return indexPath;
  }

  if (!existsSync(candidate)) {
    return indexPath;
  }

  const stats = await stat(candidate);
  if (stats.isDirectory()) {
    return indexPath;
  }

  return candidate;
}

const server = createServer(async (request, response) => {
  if (await handleMarkdownPdfRequest(request, response)) {
    return;
  }

  try {
    const urlPath = request.url?.split('?')[0] || '/';
    const resolvedPath =
      urlPath === '/' ? indexPath : await resolveAssetPath(urlPath);
    const ext = path.extname(resolvedPath).toLowerCase();

    response.statusCode = 200;
    response.setHeader(
      'Content-Type',
      mimeTypes[ext] || 'application/octet-stream'
    );

    createReadStream(resolvedPath).pipe(response);
  } catch (error) {
    response.statusCode = 500;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end(
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`OmniTools server listening on http://localhost:${port}`);
});
