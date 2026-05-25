import { NextResponse } from 'next/server';
import { getModels } from '@/app/lib/models';
import { serializeUser } from '@/app/lib/types';
import type { UserDTO } from '@/app/lib/types';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { User } = await getModels();
    const { id } = await params;
    const row     = await (User as any).findByPk(Number(id));
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json<UserDTO>(serializeUser(row));
  } catch (err) {
    console.error('[GET /api/users/:id]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { User } = await getModels();
    const { id } = await params;
    const body    = await request.json();

    const allowed = [
      'email', 'fullName', 'phone', 'constructionFunction',
      'permissionRole', 'avatarColor',
      'submitPhotos', 'addNotes', 'uploadInvoices', 'uploadBlueprints',
    ] as const;
    const updates: Record<string, any> = {};
    for (const k of Object.keys(body)) {
      if ((allowed as readonly string[]).includes(k as string)) {
        const camelToSnake: Record<string, string> = {
          fullName: 'full_name', constructionFunction: 'construction_function',
          permissionRole: 'permission_role', avatarColor: 'avatar_color',
          submitPhotos: 'submit_photos', addNotes: 'add_notes',
          uploadInvoices: 'upload_invoices', uploadBlueprints: 'upload_blueprints',
        };
        updates[camelToSnake[k as string] ?? k] = body[k];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid update fields' }, { status: 400 });
    }

    const [updated] = await (User as any).update(updates, { where: { id: Number(id) }, returning: true });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json<UserDTO>(serializeUser(updated));
  } catch (err) {
    console.error('[PATCH /api/users/:id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { User } = await getModels();
    const { id } = await params;
    const count = await (User as any).destroy({ where: { id: Number(id) } });
    if (!count) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error('[DELETE /api/users/:id]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
