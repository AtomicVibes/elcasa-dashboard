import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { log, logError } from '@/app/lib/logger';
import { serializeUser } from '@/app/lib/types';
import type { UserDTO } from '@/app/lib/types';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sql = getDb();
    const { id } = await params;

    const rows = await sql`SELECT * FROM users WHERE id = ${Number(id)}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    log('users.get', { id });
    return NextResponse.json<UserDTO>(serializeUser(rows[0]));
  } catch (err) {
    logError('users.get.error', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body = await request.json();

    const allowed = [
      'email', 'fullName', 'phone', 'constructionFunction',
      'permissionRole', 'avatarColor',
      'submitPhotos', 'addNotes', 'uploadInvoices', 'uploadBlueprints',
    ] as const;
    const camelToSnake: Record<string, string> = {
      fullName: 'full_name', constructionFunction: 'construction_function',
      permissionRole: 'permission_role', avatarColor: 'avatar_color',
      submitPhotos: 'submit_photos', addNotes: 'add_notes',
      uploadInvoices: 'upload_invoices', uploadBlueprints: 'upload_blueprints',
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const k of Object.keys(body)) {
      if ((allowed as readonly string[]).includes(k as string)) {
        const col = camelToSnake[k as string] ?? k;
        setClauses.push(`${col} = $${idx++}`);
        values.push(body[k]);
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No valid update fields' }, { status: 400 });
    }

    values.push(Number(id));
    const rows = await sql.query(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    log('users.update', { id });
    return NextResponse.json<UserDTO>(serializeUser(rows[0]));
  } catch (err) {
    logError('users.update.error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const sql = getDb();
    const { id } = await params;

    const result = await sql`DELETE FROM users WHERE id = ${Number(id)}`;
    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    log('users.delete', { id });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    logError('users.delete.error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
