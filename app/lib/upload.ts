import multer from 'multer';
import type { NextRequest } from 'next/server';

/** Middleware factory — adapts Express-style multer for Next.js route handlers */
export function multerMiddleware() {
  return async (request: NextRequest): Promise<{
    fields: Record<string, string>;
    files:  Record<string, Array<{ buffer: Buffer; originalname: string; mimetype: string }>>;
  }> => {
    const boundary = request.headers.get('content-type')?.split('boundary=')[1];
    if (!boundary) {
      throw new Error('Missing multipart boundary');
    }

    const rawBody    = await request.arrayBuffer();
    const nodeBuffer = Buffer.from(rawBody);

    return parseMultipartForm(nodeBuffer, boundary);
  };
}

function parseMultipartForm(buffer: Buffer, boundary: string): {
  fields: Record<string, string>;
  files:  Record<string, { buffer: Buffer; originalname: string; mimetype: string }[]>;
} {
  const fields: Record<string, string> = {};
  const files:  Record<string, any[]>  = {};

  const boundaryBytes = Buffer.from(`--${boundary}`);
  let   searchFrom    = 0;

  while (searchFrom < buffer.length) {
    const nextBoundary = buffer.indexOf(boundaryBytes, searchFrom);
    if (nextBoundary === -1) break;

    // Skip past the boundary line (+ CRLF)
    let bodyStart = nextBoundary + boundaryBytes.length;
    while (bodyStart < buffer.length && (buffer[bodyStart] === 13 || buffer[bodyStart] === 10)) {
      bodyStart++;
    }

    const nextBoundaryEnd = buffer.indexOf(boundaryBytes, bodyStart);
    if (nextBoundaryEnd === -1) break;

    const rawPart = buffer.slice(bodyStart, nextBoundaryEnd);
    const headersEnd = rawPart.indexOf('\r\n\r\n');

    if (headersEnd === -1) { searchFrom = nextBoundaryEnd; continue; }

    const headerSection = rawPart.slice(0, headersEnd).toString('utf-8');
    const partBody      = rawPart.slice(headersEnd + 4);

    const cdispMatch = headerSection.match(/Content-Disposition:\s*form-data;\s*name="([^"]+)"/i);
    if (!cdispMatch) { searchFrom = nextBoundaryEnd; continue; }

    const fieldName = cdispMatch[1];

    if (fieldName === 'file' || fieldName === 'images') {
      const ctypeMatch = headerSection.match(/Content-Type:\s*([^\r\n]+)/i);
      const arr        = files[fieldName] ?? [];
      arr.push({
        buffer:     partBody,
        originalname: `upload-${Date.now()}.jpg`,
        mimetype:   ctypeMatch?.[1] ?? 'image/jpeg',
      });
      files[fieldName] = arr;
    } else {
      fields[fieldName] = partBody.toString('utf-8');
    }

    searchFrom = nextBoundaryEnd;
  }

  return { fields, files };
}
