import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/server';
import { uploadToSupabase } from '@/app/lib/supabaseStorage';

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

    const publicUrl = await uploadToSupabase(buf, file.name, file.type || 'image/jpeg', pathPrefix);

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error('[POST /api/upload]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
