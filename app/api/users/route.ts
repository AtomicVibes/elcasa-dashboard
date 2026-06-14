import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { log, logError } from '@/app/lib/logger';
import { serializeUser } from '@/app/lib/types';
import type { UserDTO } from '@/app/lib/types';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM users ORDER BY created_at ASC`;
    const payload = (rows || []).map((r: any) => serializeUser(r));
    log('users.list', { count: payload.length });
    return NextResponse.json<UserDTO[]>(payload);
  } catch (err) {
    logError('users.list.error', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = getDb();
    const body = await request.json();
    const {
      email,
      fullName,
      phone,
      constructionFunction,
      permissionRole,
      avatarColor,
      submitPhotos,
      addNotes,
      uploadInvoices,
      uploadBlueprints,
      password,
    } = body;

    if (!email || !fullName) {
      return NextResponse.json({ error: 'email and fullName are required' }, { status: 400 });
    }

    const bcryptjs = await import('bcryptjs');
    const passwordHash = password ? bcryptjs.hashSync(password, 12) : null;

    const created = await sql`
      INSERT INTO users (email, full_name, phone, construction_function, permission_role, avatar_color, submit_photos, add_notes, upload_invoices, upload_blueprints, password_hash)
      VALUES (${email}, ${fullName}, ${phone ?? null}, ${constructionFunction ?? null}, ${permissionRole ?? 'view_only'}, ${avatarColor ?? '#FFB800'}, ${Boolean(submitPhotos)}, ${Boolean(addNotes)}, ${Boolean(uploadInvoices)}, ${Boolean(uploadBlueprints)}, ${passwordHash})
      RETURNING *
    `;

    log('users.create', { id: created[0]?.id, email });
    return NextResponse.json<UserDTO>(serializeUser(created[0]), { status: 201 });
  } catch (err: any) {
    if (err?.code === '23505') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    logError('users.create.error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
