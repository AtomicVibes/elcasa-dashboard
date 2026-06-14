import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { log, logError } from '@/app/lib/logger';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT id, client_name, address, estimated_budget, status, created_at
      FROM renovation_requests
      ORDER BY created_at DESC
    `;
    log('renovation.list', { count: rows?.length });
    return NextResponse.json(rows || []);
  } catch (err) {
    logError('renovation.list.error', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sql = getDb();
    const body = await request.json();

    const {
      clientName, address, workType, cleanedDescription,
      estimatedBudget, budgetFeasibility, photoAnalysisNotes,
      uploadedPhotoUrl, status,
    } = body;

    if (!clientName) {
      return NextResponse.json({ error: 'clientName is required' }, { status: 400 });
    }

    const created = await sql`
      INSERT INTO renovation_requests
        (client_name, address, work_type, cleaned_description, estimated_budget, budget_feasibility, photo_analysis_notes, uploaded_photo_url, status)
      VALUES
        (${clientName}, ${address ?? null}, ${workType ?? null}, ${cleanedDescription ?? null},
         ${estimatedBudget ?? null}, ${budgetFeasibility ?? null}, ${photoAnalysisNotes ?? null},
         ${uploadedPhotoUrl ?? null}, ${status ?? 'Pending Review'})
      RETURNING *
    `;

    log('renovation.create', { id: created[0]?.id, clientName });
    return NextResponse.json(created[0], { status: 201 });
  } catch (err) {
    logError('renovation.create.error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
