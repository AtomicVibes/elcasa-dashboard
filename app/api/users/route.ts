import { NextResponse } from 'next/server';
import { getSupabase } from '@/app/lib/supabase';
import { serializeUser } from '@/app/lib/types';
import type { UserDTO } from '@/app/lib/types';

export async function GET(_req: Request) {
  try {
    const supabase = getSupabase();
    const { data: rows, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    const payload = (rows || []).map((r: any) => serializeUser(r));
    return NextResponse.json<UserDTO[]>(payload);
  } catch (err) {
    console.error('[GET /api/users]', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
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

    const { data: created, error } = await supabase
      .from('users')
      .insert({
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
      })
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json<UserDTO>(serializeUser(created), { status: 201 });
  } catch (err) {
    console.error('[POST /api/users]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
