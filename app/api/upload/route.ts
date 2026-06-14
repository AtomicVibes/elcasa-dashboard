import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { log, logError } from '@/app/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { data: session } = await auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized — you must be signed in' }, { status: 401 });
    }

    const formData = await request.formData();
    const file     = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file in request' }, { status: 400 });

    const buf  = Buffer.from(await file.arrayBuffer());
    const pathPrefix =
      formData.get('pathPrefix')?.toString() ??
      formData.get('folder')?.toString() ??
      'projects';

    // TODO: Replace with Cloudflare R2 / S3 / Neon BLOB storage
    // Currently no storage backend is configured.
    // Save file metadata to DB:
    // const sql = getDb();
    // await sql`INSERT INTO files (name, size, type, path, user_id) VALUES (${file.name}, ${buf.length}, ${file.type}, ${pathPrefix + '/' + file.name}, ${session.user.id})`;

    log('upload', { fileName: file.name, pathPrefix, userId: session.user.id });
    return NextResponse.json({
      url: `/placeholder/${pathPrefix}/${file.name}`,
      note: 'Storage backend not configured. File metadata not persisted.',
    });
  } catch (err) {
    logError('upload.error', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
