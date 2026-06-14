import { NextResponse } from 'next/server';
import { getDb } from '@/app/lib/db';
import { log, logError } from '@/app/lib/logger';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;

    const rows = await sql`SELECT * FROM renovation_requests WHERE id = ${Number(id)}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    log('renovation.get', { id });
    return NextResponse.json(rows[0]);
  } catch (err) {
    logError('renovation.get.error', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sql = getDb();
    const { id } = await params;
    const body  = await request.json();

    const allowed = [
      'clientName', 'address', 'workType', 'cleanedDescription',
      'estimatedBudget', 'budgetFeasibility', 'photoAnalysisNotes',
      'uploadedPhotoUrl', 'status',
    ];
    const snakeMap: Record<string, string> = {
      clientName: 'client_name', workType: 'work_type',
      cleanedDescription: 'cleaned_description', estimatedBudget: 'estimated_budget',
      budgetFeasibility: 'budget_feasibility', photoAnalysisNotes: 'photo_analysis_notes',
      uploadedPhotoUrl: 'uploaded_photo_url',
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const k of Object.keys(body)) {
      if (allowed.includes(k)) {
        const col = snakeMap[k] ?? k;
        setClauses.push(`${col} = $${idx++}`);
        values.push(body[k]);
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No valid update fields' }, { status: 400 });
    }

    values.push(Number(id));
    const rows = await sql.query(
      `UPDATE renovation_requests SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    log('renovation.update', { id, status: body.status });
    return NextResponse.json(rows[0]);
  } catch (err) {
    logError('renovation.update.error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
