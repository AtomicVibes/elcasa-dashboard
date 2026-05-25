import type { NextRequest } from 'next/server';
import { getModels } from '@/app/lib/models';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {
  try {
    const { Customer } = await getModels();
    const customers = await (Customer as any).findAll({
      order: [['createdAt', 'DESC']],
      raw: true,
    });

    return Response.json({ customers }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database connectivity error';

    return Response.json(
      {
        error: 'Failed to fetch customers',
        message,
      },
      { status: 500 },
    );
  }
}
