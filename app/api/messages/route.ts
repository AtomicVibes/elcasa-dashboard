import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { log, logError } from '@/app/lib/logger';

export async function POST(request: Request) {
  try {
    const sql = getDb();
    const body = await request.json();
    const { senderId, recipientId, recipientName, projectId, content, type } = body;

    if (!senderId || !content) {
      return NextResponse.json({ error: 'senderId and content are required' }, { status: 400 });
    }

    const created = await sql`
      INSERT INTO messages (sender_id, recipient_id, recipient_name, project_id, content, type)
      VALUES (${senderId}, ${recipientId ?? null}, ${recipientName ?? null}, ${projectId ?? null}, ${content}, ${type ?? 'text'})
      RETURNING *
    `;

    log('messages.create', { id: created[0]?.id, type, senderId });
    return NextResponse.json(created[0], { status: 201 });
  } catch (err) {
    logError('messages.create.error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
