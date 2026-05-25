import { NextResponse } from 'next/server';
import { User } from '@/app/lib/models';
import { serializeUser } from '@/app/lib/types';
import type { UserDTO } from '@/app/lib/types';

export const runtime = 'nodejs';

// Ensure DB connection on cold-start
if (!(User as any).sequelize) {
  (User as any).sequelize = (require('@/app/lib/models') as any).sequelize;
}

function getTable(): any { return User; }

// ─── GET /api/users ─────────────────────────────────────────────────────────
export async function GET(_req: Request) {
  try {
    const rows    = await getTable().findAll({ order: [['created_at', 'ASC']] });
    const payload = rows.map((r: any) => serializeUser(r));
    return NextResponse.json<UserDTO[]>(payload);
  } catch (err) {
    console.error('[GET /api/users]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

// ─── POST /api/users ─────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
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

    const passwordHash = password ? require('bcryptjs').hashSync(password, 12) : null;

    const created = await getTable().create({
      email,
      full_name:        fullName,
      phone:            phone ?? null,
      construction_function: constructionFunction ?? null,
      permission_role:  permissionRole ?? 'view_only',
      avatar_color:     avatarColor ?? '#FFB800',
      submit_photos:    Boolean(submitPhotos),
      add_notes:        Boolean(addNotes),
      upload_invoices:  Boolean(uploadInvoices),
      upload_blueprints:Boolean(uploadBlueprints),
      password_hash:    passwordHash,
    });

    return NextResponse.json<UserDTO>(serializeUser(created), { status: 201 });
  } catch (err: any) {
    if (err?.name === 'SequelizeUniqueConstraintError') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    console.error('[POST /api/users]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
