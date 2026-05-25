import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabase } from '@/app/lib/supabaseStorage';

export const runtime = 'nodejs';

// ─── POST /api/upload ────────────────────────────────────────────────────────
// AuthGate → Supabase Upload wrapper
export async function POST(request: NextRequest) {
  try {
    // Authorisation guard
    const auth    = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized — valid auth token required in Authorization header' }, { status: 401 });
    }
    const token = auth.slice('Bearer '.length);
    // JWT matters — legacy auth token sent by Upload component + API
    const secret = process.env.JWT_SECRET;
    if (!secret || !token) {
      return NextResponse.json({ error: 'JWT_SECRET not configured' }, { status: 500 });
    }
    try {
      require('jsonwebtoken').verify(token, secret);
    } catch {
      return NextResponse.json({ error: 'Invalid auth token — you must be signed in to load this page' }, { status: 403 });
    }

    const formData = await request.formData();
    const file     = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file in request' }, { status: 400 });

    const buf  = Buffer.from(await file.arrayBuffer());
    const pathPrefix =
      formData.get('pathPrefix')?.toString() ??
      formData.get('folder')?.toString() ??
      'projects';

    const publicUrl = await uploadToSupabase(buf, file.name, file.type || 'image/jpeg', pathPrefix);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error('[POST /api/upload]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
